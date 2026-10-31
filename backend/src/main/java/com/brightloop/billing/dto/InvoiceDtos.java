package com.brightloop.billing.dto;

import com.brightloop.billing.model.InvoiceStatus;
import com.brightloop.billing.model.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public final class InvoiceDtos {

    private InvoiceDtos() {
    }

    public record InvoiceRow(Long id, String number, String customerName, String subscriptionNumber,
                             LocalDate invoiceDate, LocalDate dueDate, InvoiceStatus status, BigDecimal total,
                             BigDecimal amountPaid, boolean overdue) {
    }

    public record InvoiceLineView(String description, int quantity, BigDecimal unitPrice, BigDecimal taxRate,
                                  BigDecimal amount) {
    }

    public record PaymentView(Long id, PaymentMethod method, BigDecimal amount, LocalDate paymentDate, String note) {
    }

    public record InvoiceDetail(Long id, String number, Long subscriptionId, String subscriptionNumber,
                                String customerName, String customerEmail, LocalDate invoiceDate, LocalDate dueDate,
                                LocalDate periodStart, LocalDate periodEnd, InvoiceStatus status, BigDecimal subtotal,
                                BigDecimal discountAmount, String discountLabel, BigDecimal taxAmount,
                                BigDecimal total, BigDecimal amountPaid, BigDecimal balance, boolean overdue,
                                List<InvoiceLineView> lines, List<PaymentView> payments) {
    }

    public record PaymentRequest(
            @NotNull(message = "Choose a payment method") PaymentMethod method,
            @NotNull(message = "Amount is required") @Positive(message = "Amount must be greater than zero") BigDecimal amount,
            LocalDate paymentDate,
            String note) {
    }

    public record PaymentRow(Long id, String invoiceNumber, String customerName, PaymentMethod method,
                             BigDecimal amount, LocalDate paymentDate, String note) {
    }
}
