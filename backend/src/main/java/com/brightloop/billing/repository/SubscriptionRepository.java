package com.brightloop.billing.repository;

import com.brightloop.billing.model.Subscription;
import com.brightloop.billing.model.SubscriptionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long>, JpaSpecificationExecutor<Subscription> {

    @Override
    @EntityGraph(attributePaths = {"customer", "plan"})
    Page<Subscription> findAll(Specification<Subscription> spec, Pageable pageable);

    @EntityGraph(attributePaths = {"customer", "plan"})
    List<Subscription> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    @Query("select s.id from Subscription s where s.status = com.brightloop.billing.model.SubscriptionStatus.ACTIVE and s.nextBillingDate <= :today")
    List<Long> findDueIds(@Param("today") LocalDate today);

    long countByStatus(SubscriptionStatus status);

    @Query("select s.plan.billingPeriod, sum(l.unitPrice * l.quantity) from Subscription s join s.lines l " +
            "where s.status = com.brightloop.billing.model.SubscriptionStatus.ACTIVE group by s.plan.billingPeriod")
    List<Object[]> activeRecurringByPeriod();

    @Modifying
    @Transactional
    @Query("update Subscription s set s.status = com.brightloop.billing.model.SubscriptionStatus.CLOSED " +
            "where s.status = com.brightloop.billing.model.SubscriptionStatus.ACTIVE and s.expiryDate < :today " +
            "and s.plan.id in (select p.id from Plan p where p.autoClose = true)")
    int closeExpired(@Param("today") LocalDate today);
}
