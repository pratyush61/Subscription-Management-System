package com.brightloop.billing.controller;

import com.brightloop.billing.dto.InvoiceDtos.InvoiceDetail;
import com.brightloop.billing.dto.InvoiceDtos.InvoiceRow;
import com.brightloop.billing.dto.InvoiceDtos.PaymentRequest;
import com.brightloop.billing.dto.InvoiceDtos.PaymentRow;
import com.brightloop.billing.dto.PageResponse;
import com.brightloop.billing.model.InvoiceStatus;
import com.brightloop.billing.service.BillingService;
import com.brightloop.billing.service.InvoiceService;
import com.brightloop.billing.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final PaymentService paymentService;
    private final BillingService billingService;

    @GetMapping("/invoices")
    public PageResponse<InvoiceRow> list(@RequestParam(required = false) InvoiceStatus status,
                                         @RequestParam(defaultValue = "false") boolean overdue,
                                         @RequestParam(required = false) String search,
                                         @RequestParam(defaultValue = "0") int page,
                                         @RequestParam(defaultValue = "10") int size) {
        return invoiceService.list(status, overdue, search, page, size);
    }

    @GetMapping("/invoices/{id}")
    public InvoiceDetail get(@PathVariable Long id) {
        return invoiceService.detail(id);
    }

    @PostMapping("/invoices/{id}/confirm")
    public InvoiceDetail confirm(@PathVariable Long id) {
        invoiceService.confirm(id);
        return invoiceService.detail(id);
    }

    @PostMapping("/invoices/{id}/cancel")
    public InvoiceDetail cancel(@PathVariable Long id) {
        invoiceService.cancel(id);
        return invoiceService.detail(id);
    }

    @PostMapping("/invoices/{id}/send")
    public Map<String, String> send(@PathVariable Long id) {
        invoiceService.send(id);
        return Map.of("message", "Invoice sent to the customer");
    }

    @PostMapping("/invoices/confirm-drafts")
    public Map<String, Integer> confirmDrafts() {
        return Map.of("confirmed", invoiceService.confirmAllDrafts());
    }

    @PostMapping("/invoices/{id}/payments")
    public InvoiceDetail pay(@PathVariable Long id, @Valid @RequestBody PaymentRequest request) {
        paymentService.record(id, request);
        return invoiceService.detail(id);
    }

    @GetMapping("/payments")
    public PageResponse<PaymentRow> payments(@RequestParam(defaultValue = "0") int page,
                                             @RequestParam(defaultValue = "10") int size) {
        return paymentService.list(page, size);
    }

    @PostMapping("/billing/run")
    public BillingService.RunResult runBilling() {
        return billingService.runBilling();
    }
}
