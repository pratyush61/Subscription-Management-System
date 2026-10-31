package com.brightloop.billing.dto;

import com.brightloop.billing.model.BillingPeriod;
import com.brightloop.billing.model.SubscriptionStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public final class SubscriptionDtos {

    private SubscriptionDtos() {
    }

    public record LineRequest(
            @NotNull(message = "Pick a product for every line") Long productId,
            Long variantId,
            @NotNull Integer quantity,
            Long taxId) {
    }

    public record SubscriptionRequest(
            @NotNull(message = "Choose a customer") Long customerId,
            @NotNull(message = "Choose a plan") Long planId,
            @NotNull(message = "Start date is required") LocalDate startDate,
            LocalDate expiryDate,
            String paymentTerms,
            Long discountId,
            Long templateId,
            @NotEmpty(message = "Add at least one product line") @Valid List<LineRequest> lines) {
    }

    public record LineView(Long productId, String productName, Long variantId, String variantLabel, int quantity,
                           BigDecimal unitPrice, Long taxId, String taxName, BigDecimal taxRate, BigDecimal amount) {
    }

    public record SubscriptionRow(Long id, String number, String customerName, String planName, LocalDate startDate,
                                  LocalDate expiryDate, SubscriptionStatus status, BigDecimal recurringAmount) {
    }

    public record SubscriptionDetail(Long id, String number, Long customerId, String customerName, Long planId,
                                     String planName, BillingPeriod billingPeriod, LocalDate startDate,
                                     LocalDate expiryDate, String paymentTerms, SubscriptionStatus status,
                                     LocalDate nextBillingDate, LocalDate quotationValidUntil, Long discountId,
                                     String discountName, BigDecimal recurringAmount, boolean closable,
                                     boolean pausable, boolean renewable, List<LineView> lines) {
    }
}
