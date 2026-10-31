package com.brightloop.billing.model;

import java.time.LocalDate;

public enum BillingPeriod {
    DAILY, WEEKLY, MONTHLY, YEARLY;

    public LocalDate next(LocalDate from) {
        return switch (this) {
            case DAILY -> from.plusDays(1);
            case WEEKLY -> from.plusWeeks(1);
            case MONTHLY -> from.plusMonths(1);
            case YEARLY -> from.plusYears(1);
        };
    }

    public double monthlyFactor() {
        return switch (this) {
            case DAILY -> 30;
            case WEEKLY -> 52.0 / 12;
            case MONTHLY -> 1;
            case YEARLY -> 1.0 / 12;
        };
    }
}
