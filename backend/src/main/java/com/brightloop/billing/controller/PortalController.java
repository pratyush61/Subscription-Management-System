package com.brightloop.billing.controller;

import com.brightloop.billing.dto.InvoiceDtos.InvoiceDetail;
import com.brightloop.billing.dto.InvoiceDtos.InvoiceRow;
import com.brightloop.billing.dto.InvoiceDtos.PaymentRequest;
import com.brightloop.billing.dto.SubscriptionDtos.SubscriptionDetail;
import com.brightloop.billing.exception.ApiException;
import com.brightloop.billing.model.PaymentMethod;
import com.brightloop.billing.model.SubscriptionStatus;
import com.brightloop.billing.model.User;
import com.brightloop.billing.repository.UserRepository;
import com.brightloop.billing.service.InvoiceService;
import com.brightloop.billing.service.PaymentService;
import com.brightloop.billing.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/portal")
@RequiredArgsConstructor
public class PortalController {

    private static final Set<SubscriptionStatus> CUSTOMER_MOVES =
            Set.of(SubscriptionStatus.ACTIVE, SubscriptionStatus.PAUSED, SubscriptionStatus.CLOSED);

    private final UserRepository users;
    private final SubscriptionService subscriptionService;
    private final InvoiceService invoiceService;
    private final PaymentService paymentService;

    @GetMapping("/subscriptions")
    public List<SubscriptionDetail> subscriptions(Authentication auth) {
        return subscriptionService.forCustomer(me(auth).getId());
    }

    @PostMapping("/subscriptions/{id}/status")
    public SubscriptionDetail move(Authentication auth, @PathVariable Long id, @RequestParam SubscriptionStatus to) {
        requireOwner(auth, subscriptionService.ownerId(id));
        SubscriptionStatus current = subscriptionService.detail(id).status();
        boolean running = current == SubscriptionStatus.ACTIVE || current == SubscriptionStatus.PAUSED;
        if (!CUSTOMER_MOVES.contains(to) || !running) {
            throw ApiException.forbidden("You can pause, resume or close a running subscription from here");
        }
        return subscriptionService.move(id, to);
    }

    @GetMapping("/invoices")
    public List<InvoiceRow> invoices(Authentication auth) {
        return invoiceService.forCustomer(me(auth).getId());
    }

    @GetMapping("/invoices/{id}")
    public InvoiceDetail invoice(Authentication auth, @PathVariable Long id) {
        requireOwner(auth, invoiceOwner(id));
        return invoiceService.detail(id);
    }

    @PostMapping("/invoices/{id}/pay")
    public InvoiceDetail pay(Authentication auth, @PathVariable Long id) {
        requireOwner(auth, invoiceOwner(id));
        InvoiceDetail detail = invoiceService.detail(id);
        paymentService.record(id, new PaymentRequest(PaymentMethod.CARD, detail.balance(), LocalDate.now(), "Paid online from customer portal"));
        return invoiceService.detail(id);
    }

    private Long invoiceOwner(Long invoiceId) {
        return invoiceService.ownerId(invoiceId);
    }

    private User me(Authentication auth) {
        return users.findByEmailIgnoreCase(auth.getName()).orElseThrow(() -> ApiException.forbidden("Please sign in again"));
    }

    private void requireOwner(Authentication auth, Long ownerId) {
        if (!me(auth).getId().equals(ownerId)) {
            throw ApiException.forbidden("This item belongs to another account");
        }
    }
}
