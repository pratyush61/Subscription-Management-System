package com.brightloop.billing.service;

import com.brightloop.billing.dto.InvoiceDtos.InvoiceDetail;
import com.brightloop.billing.dto.InvoiceDtos.InvoiceRow;
import com.brightloop.billing.dto.Mapper;
import com.brightloop.billing.dto.PageResponse;
import com.brightloop.billing.exception.ApiException;
import com.brightloop.billing.model.*;
import com.brightloop.billing.repository.InvoiceRepository;
import com.brightloop.billing.repository.PaymentRepository;
import com.brightloop.billing.repository.SubscriptionRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoices;
    private final SubscriptionRepository subscriptions;
    private final PaymentRepository payments;
    private final DiscountService discountService;
    private final EmailService emailService;

    @Transactional
    public boolean billNextPeriod(Long subscriptionId, LocalDate today) {
        Subscription sub = subscriptions.findById(subscriptionId).orElse(null);
        if (sub == null || sub.getStatus() != SubscriptionStatus.ACTIVE || sub.getNextBillingDate() == null
                || sub.getNextBillingDate().isAfter(today)) {
            return false;
        }

        LocalDate periodStart = sub.getNextBillingDate();
        LocalDate nextStart = sub.getPlan().getBillingPeriod().next(periodStart);

        if (sub.getExpiryDate() != null && periodStart.isAfter(sub.getExpiryDate())) {
            if (sub.getPlan().isAutoClose()) {
                sub.setStatus(SubscriptionStatus.CLOSED);
            }
            return false;
        }

        if (invoices.existsBySubscriptionIdAndPeriodStart(sub.getId(), periodStart)) {
            sub.setNextBillingDate(nextStart);
            return true;
        }

        Invoice invoice = new Invoice();
        invoice.setSubscription(sub);
        invoice.setCustomer(sub.getCustomer());
        invoice.setInvoiceDate(today);
        invoice.setDueDate(today.plusDays(termDays(sub.getPaymentTerms())));
        invoice.setPeriodStart(periodStart);
        invoice.setPeriodEnd(nextStart.minusDays(1));

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal tax = BigDecimal.ZERO;
        for (SubscriptionLine l : sub.getLines()) {
            BigDecimal amount = l.amount();
            BigDecimal rate = l.getTax() != null ? l.getTax().getRate() : BigDecimal.ZERO;

            InvoiceLine line = new InvoiceLine();
            line.setProductId(l.getProduct().getId());
            line.setDescription(l.getVariantLabel() != null && !l.getVariantLabel().isBlank()
                    ? l.getProduct().getName() + " (" + l.getVariantLabel() + ")" : l.getProduct().getName());
            line.setQuantity(l.getQuantity());
            line.setUnitPrice(l.getUnitPrice());
            line.setTaxRate(rate);
            line.setAmount(amount);
            invoice.getLines().add(line);

            subtotal = subtotal.add(amount);
            tax = tax.add(amount.multiply(rate).divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));
        }

        DiscountService.Result discount = discountService.apply(sub, invoice.getLines(), subtotal, today);
        BigDecimal factor = subtotal.signum() == 0 ? BigDecimal.ONE
                : subtotal.subtract(discount.amount()).divide(subtotal, 6, RoundingMode.HALF_UP);
        BigDecimal taxAmount = tax.multiply(factor).setScale(2, RoundingMode.HALF_UP);

        invoice.setSubtotal(subtotal);
        invoice.setDiscountAmount(discount.amount());
        invoice.setDiscountLabel(discount.label());
        invoice.setTaxAmount(taxAmount);
        invoice.setTotal(subtotal.subtract(discount.amount()).add(taxAmount));

        Invoice saved = invoices.save(invoice);
        saved.setNumber(String.format("INV%06d", saved.getId()));
        sub.setNextBillingDate(nextStart);
        return true;
    }

    @Transactional(readOnly = true)
    public PageResponse<InvoiceRow> list(InvoiceStatus status, boolean overdue, String search, int page, int size) {
        Specification<Invoice> spec = (root, query, cb) -> {
            List<Predicate> filters = new ArrayList<>();
            if (status != null) {
                filters.add(cb.equal(root.get("status"), status));
            }
            if (overdue) {
                filters.add(cb.equal(root.get("status"), InvoiceStatus.CONFIRMED));
                filters.add(cb.lessThan(root.get("dueDate"), LocalDate.now()));
            }
            if (search != null && !search.isBlank()) {
                String like = "%" + search.trim().toLowerCase() + "%";
                filters.add(cb.or(cb.like(cb.lower(root.get("number")), like),
                        cb.like(cb.lower(root.get("customer").get("name")), like)));
            }
            return cb.and(filters.toArray(new Predicate[0]));
        };
        PageRequest pageable = PageRequest.of(page, Math.min(size, 100), Sort.by(Sort.Direction.DESC, "id"));
        return PageResponse.of(invoices.findAll(spec, pageable), Mapper::row);
    }

    @Transactional(readOnly = true)
    public InvoiceDetail detail(Long id) {
        Invoice invoice = find(id);
        return Mapper.detail(invoice, payments.findByInvoiceIdOrderByPaymentDateDesc(id));
    }

    @Transactional(readOnly = true)
    public List<InvoiceRow> forCustomer(Long customerId) {
        return invoices.findByCustomerIdOrderByInvoiceDateDesc(customerId).stream()
                .filter(i -> i.getStatus() != InvoiceStatus.DRAFT && i.getStatus() != InvoiceStatus.CANCELLED)
                .map(Mapper::row).toList();
    }

    @Transactional
    public InvoiceDetail confirm(Long id) {
        Invoice invoice = find(id);
        if (invoice.getStatus() != InvoiceStatus.DRAFT) {
            throw ApiException.badRequest("Only draft invoices can be confirmed");
        }
        invoice.setStatus(InvoiceStatus.CONFIRMED);
        return Mapper.detail(invoice, List.of());
    }

    @Transactional
    public int confirmAllDrafts() {
        List<Invoice> drafts = invoices.findByStatus(InvoiceStatus.DRAFT);
        drafts.forEach(i -> i.setStatus(InvoiceStatus.CONFIRMED));
        return drafts.size();
    }

    @Transactional
    public InvoiceDetail cancel(Long id) {
        Invoice invoice = find(id);
        if (invoice.getStatus() == InvoiceStatus.PAID || invoice.getAmountPaid().signum() > 0) {
            throw ApiException.badRequest("An invoice with payments cannot be cancelled");
        }
        invoice.setStatus(InvoiceStatus.CANCELLED);
        return Mapper.detail(invoice, List.of());
    }

    @Transactional(readOnly = true)
    public void send(Long id) {
        Invoice invoice = find(id);
        if (invoice.getStatus() == InvoiceStatus.DRAFT || invoice.getStatus() == InvoiceStatus.CANCELLED) {
            throw ApiException.badRequest("Confirm the invoice before sending it");
        }
        String body = "Hi " + invoice.getCustomer().getName() + ",\n\nInvoice " + invoice.getNumber()
                + " for " + invoice.getTotal() + " is due on " + invoice.getDueDate()
                + ". Outstanding balance: " + invoice.balance() + ".\n\nThank you,\nBrightloop Software";
        emailService.send(invoice.getCustomer().getEmail(), "Invoice " + invoice.getNumber() + " from Brightloop", body);
    }

    @Transactional(readOnly = true)
    public Long ownerId(Long id) {
        return find(id).getCustomer().getId();
    }

    public Invoice find(Long id) {
        return invoices.findById(id).orElseThrow(() -> ApiException.notFound("Invoice"));
    }

    private int termDays(String terms) {
        if (terms == null) {
            return 0;
        }
        String digits = terms.replaceAll("\\D", "");
        return digits.isEmpty() ? 0 : Integer.parseInt(digits);
    }
}
