package com.brightloop.billing.dto;

import com.brightloop.billing.dto.InvoiceDtos.*;
import com.brightloop.billing.dto.SubscriptionDtos.*;
import com.brightloop.billing.model.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public final class Mapper {

    private Mapper() {
    }

    public static SubscriptionRow row(Subscription s) {
        return new SubscriptionRow(s.getId(), s.getNumber(), s.getCustomer().getName(), s.getPlan().getName(),
                s.getStartDate(), s.getExpiryDate(), s.getStatus(), s.getRecurringAmount());
    }

    public static SubscriptionDetail detail(Subscription s) {
        List<LineView> lines = s.getLines().stream().map(l -> new LineView(
                l.getProduct().getId(), l.getProduct().getName(), l.getVariantId(), l.getVariantLabel(), l.getQuantity(),
                l.getUnitPrice(), l.getTax() != null ? l.getTax().getId() : null,
                l.getTax() != null ? l.getTax().getName() : null,
                l.getTax() != null ? l.getTax().getRate() : BigDecimal.ZERO, l.amount())).toList();
        Plan p = s.getPlan();
        return new SubscriptionDetail(s.getId(), s.getNumber(), s.getCustomer().getId(), s.getCustomer().getName(),
                p.getId(), p.getName(), p.getBillingPeriod(), s.getStartDate(), s.getExpiryDate(),
                s.getPaymentTerms(), s.getStatus(), s.getNextBillingDate(), s.getQuotationValidUntil(),
                s.getDiscount() != null ? s.getDiscount().getId() : null,
                s.getDiscount() != null ? s.getDiscount().getName() : null,
                s.getRecurringAmount(), p.isClosable(), p.isPausable(), p.isRenewable(), lines);
    }

    public static boolean overdue(Invoice i) {
        return i.getStatus() == InvoiceStatus.CONFIRMED && i.getDueDate() != null
                && i.getDueDate().isBefore(LocalDate.now());
    }

    public static InvoiceRow row(Invoice i) {
        return new InvoiceRow(i.getId(), i.getNumber(), i.getCustomer().getName(), i.getSubscription().getNumber(),
                i.getInvoiceDate(), i.getDueDate(), i.getStatus(), i.getTotal(), i.getAmountPaid(), overdue(i));
    }

    public static InvoiceDetail detail(Invoice i, List<Payment> payments) {
        return new InvoiceDetail(i.getId(), i.getNumber(), i.getSubscription().getId(), i.getSubscription().getNumber(),
                i.getCustomer().getName(), i.getCustomer().getEmail(), i.getInvoiceDate(), i.getDueDate(),
                i.getPeriodStart(), i.getPeriodEnd(), i.getStatus(), i.getSubtotal(), i.getDiscountAmount(),
                i.getDiscountLabel(), i.getTaxAmount(), i.getTotal(), i.getAmountPaid(), i.balance(), overdue(i),
                i.getLines().stream().map(l -> new InvoiceLineView(l.getDescription(), l.getQuantity(),
                        l.getUnitPrice(), l.getTaxRate(), l.getAmount())).toList(),
                payments.stream().map(p -> new PaymentView(p.getId(), p.getMethod(), p.getAmount(),
                        p.getPaymentDate(), p.getNote())).toList());
    }
}
