package com.brightloop.billing.service;

import com.brightloop.billing.dto.InvoiceDtos.PaymentRequest;
import com.brightloop.billing.dto.InvoiceDtos.PaymentRow;
import com.brightloop.billing.dto.PageResponse;
import com.brightloop.billing.exception.ApiException;
import com.brightloop.billing.model.Invoice;
import com.brightloop.billing.model.InvoiceStatus;
import com.brightloop.billing.model.Payment;
import com.brightloop.billing.repository.InvoiceRepository;
import com.brightloop.billing.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final InvoiceRepository invoices;
    private final PaymentRepository payments;

    @Transactional
    public void record(Long invoiceId, PaymentRequest request) {
        Invoice invoice = invoices.findById(invoiceId).orElseThrow(() -> ApiException.notFound("Invoice"));
        if (invoice.getStatus() != InvoiceStatus.CONFIRMED) {
            throw ApiException.badRequest("Payments can only be recorded against confirmed invoices");
        }
        if (request.amount().compareTo(invoice.balance()) > 0) {
            throw ApiException.badRequest("Amount is more than the outstanding balance of " + invoice.balance());
        }

        Payment payment = new Payment();
        payment.setInvoice(invoice);
        payment.setMethod(request.method());
        payment.setAmount(request.amount());
        payment.setPaymentDate(request.paymentDate() != null ? request.paymentDate() : LocalDate.now());
        payment.setNote(request.note());
        payments.save(payment);

        invoice.setAmountPaid(invoice.getAmountPaid().add(request.amount()));
        if (invoice.balance().signum() == 0) {
            invoice.setStatus(InvoiceStatus.PAID);
        }
    }

    @Transactional(readOnly = true)
    public PageResponse<PaymentRow> list(int page, int size) {
        PageRequest pageable = PageRequest.of(page, Math.min(size, 100), Sort.by(Sort.Direction.DESC, "paymentDate", "id"));
        return PageResponse.of(payments.findAll(pageable), p -> new PaymentRow(p.getId(), p.getInvoice().getNumber(),
                p.getInvoice().getCustomer().getName(), p.getMethod(), p.getAmount(), p.getPaymentDate(), p.getNote()));
    }
}
