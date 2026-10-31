package com.brightloop.billing.service;

import com.brightloop.billing.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class BillingService {

    private static final int MAX_CATCH_UP_PERIODS = 24;

    private final SubscriptionRepository subscriptions;
    private final InvoiceService invoiceService;

    public record RunResult(int invoicesCreated, int subscriptionsClosed) {
    }

    @Scheduled(cron = "0 0 2 * * *")
    public void scheduledRun() {
        RunResult result = runBilling();
        log.info("Nightly billing created {} invoices and closed {} subscriptions",
                result.invoicesCreated(), result.subscriptionsClosed());
    }

    public RunResult runBilling() {
        LocalDate today = LocalDate.now();
        int closed = closeExpired(today);
        int created = 0;
        List<Long> dueIds = subscriptions.findDueIds(today);
        for (Long id : dueIds) {
            try {
                int guard = 0;
                while (guard++ < MAX_CATCH_UP_PERIODS && invoiceService.billNextPeriod(id, today)) {
                    created++;
                }
            } catch (Exception ex) {
                log.error("Billing failed for subscription {}", id, ex);
            }
        }
        return new RunResult(created, closed);
    }

    private int closeExpired(LocalDate today) {
        return subscriptions.closeExpired(today);
    }
}
