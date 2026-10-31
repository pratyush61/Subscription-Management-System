package com.brightloop.billing.service;

import com.brightloop.billing.model.*;
import com.brightloop.billing.repository.DiscountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DiscountService {

    private final DiscountRepository discounts;

    public record Result(BigDecimal amount, String label) {
    }

    public Result apply(Subscription subscription, List<InvoiceLine> lines, BigDecimal subtotal, LocalDate today) {
        Map<Long, Discount> candidates = new LinkedHashMap<>();
        if (subscription.getDiscount() != null) {
            candidates.put(subscription.getDiscount().getId(), subscription.getDiscount());
        }
        for (Discount d : discounts.findByActiveTrueAndTarget(DiscountTarget.PRODUCT)) {
            candidates.putIfAbsent(d.getId(), d);
        }

        BigDecimal total = BigDecimal.ZERO;
        List<String> names = new ArrayList<>();
        int totalQuantity = lines.stream().mapToInt(InvoiceLine::getQuantity).sum();

        for (Discount d : candidates.values()) {
            if (!isUsable(d, today)) {
                continue;
            }
            BigDecimal base = subtotal;
            int quantity = totalQuantity;
            if (d.getTarget() == DiscountTarget.PRODUCT) {
                List<InvoiceLine> matching = lines.stream()
                        .filter(l -> d.getProduct() != null && d.getProduct().getId().equals(l.getProductId()))
                        .toList();
                base = matching.stream().map(InvoiceLine::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
                quantity = matching.stream().mapToInt(InvoiceLine::getQuantity).sum();
            }
            if (base.signum() == 0) {
                continue;
            }
            if (d.getMinPurchase() != null && base.compareTo(d.getMinPurchase()) < 0) {
                continue;
            }
            if (d.getMinQuantity() != null && quantity < d.getMinQuantity()) {
                continue;
            }
            BigDecimal off = d.getType() == DiscountType.PERCENTAGE
                    ? base.multiply(d.getValue()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP)
                    : d.getValue().min(base);
            total = total.add(off);
            names.add(d.getName());
            d.setUsedCount(d.getUsedCount() + 1);
            discounts.save(d);
        }
        return new Result(total.min(subtotal), String.join(", ", names));
    }

    public boolean isUsable(Discount d, LocalDate today) {
        if (!d.isActive()) {
            return false;
        }
        if (d.getStartDate() != null && today.isBefore(d.getStartDate())) {
            return false;
        }
        if (d.getEndDate() != null && today.isAfter(d.getEndDate())) {
            return false;
        }
        return d.getUsageLimit() == null || d.getUsedCount() < d.getUsageLimit();
    }
}
