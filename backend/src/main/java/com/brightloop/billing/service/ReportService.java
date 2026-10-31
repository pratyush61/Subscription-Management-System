package com.brightloop.billing.service;

import com.brightloop.billing.dto.ReportDtos.MonthRevenue;
import com.brightloop.billing.dto.ReportDtos.Summary;
import com.brightloop.billing.model.BillingPeriod;
import com.brightloop.billing.model.SubscriptionStatus;
import com.brightloop.billing.repository.InvoiceRepository;
import com.brightloop.billing.repository.PaymentRepository;
import com.brightloop.billing.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final SubscriptionRepository subscriptions;
    private final InvoiceRepository invoices;
    private final PaymentRepository payments;

    @Transactional(readOnly = true)
    public Summary summary() {
        LocalDate today = LocalDate.now();

        BigDecimal mrr = BigDecimal.ZERO;
        for (Object[] row : subscriptions.activeRecurringByPeriod()) {
            BillingPeriod period = (BillingPeriod) row[0];
            BigDecimal amount = (BigDecimal) row[1];
            mrr = mrr.add(amount.multiply(BigDecimal.valueOf(period.monthlyFactor())));
        }

        YearMonth current = YearMonth.now();
        Map<YearMonth, BigDecimal> totals = new HashMap<>();
        for (Object[] row : payments.monthlyTotals(current.minusMonths(5).atDay(1))) {
            totals.put(YearMonth.of(((Number) row[0]).intValue(), ((Number) row[1]).intValue()), (BigDecimal) row[2]);
        }
        List<MonthRevenue> monthly = new ArrayList<>();
        DateTimeFormatter format = DateTimeFormatter.ofPattern("MMM yy", Locale.ENGLISH);
        for (int i = 5; i >= 0; i--) {
            YearMonth month = current.minusMonths(i);
            monthly.add(new MonthRevenue(month.format(format), totals.getOrDefault(month, BigDecimal.ZERO)));
        }

        return new Summary(
                subscriptions.countByStatus(SubscriptionStatus.ACTIVE),
                mrr.setScale(2, RoundingMode.HALF_UP),
                orZero(payments.totalCollected()),
                orZero(invoices.outstandingAmount()),
                invoices.overdueCount(today),
                orZero(invoices.overdueAmount(today)),
                monthly);
    }

    private BigDecimal orZero(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }
}
