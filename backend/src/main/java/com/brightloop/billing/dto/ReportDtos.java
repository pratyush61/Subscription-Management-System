package com.brightloop.billing.dto;

import java.math.BigDecimal;
import java.util.List;

public final class ReportDtos {

    private ReportDtos() {
    }

    public record MonthRevenue(String month, BigDecimal amount) {
    }

    public record Summary(long activeSubscriptions, BigDecimal monthlyRecurringRevenue, BigDecimal revenueCollected,
                          BigDecimal outstanding, long overdueInvoices, BigDecimal overdueAmount,
                          List<MonthRevenue> monthly) {
    }
}
