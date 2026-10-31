package com.brightloop.billing.repository;

import com.brightloop.billing.model.Invoice;
import com.brightloop.billing.model.InvoiceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface InvoiceRepository extends JpaRepository<Invoice, Long>, JpaSpecificationExecutor<Invoice> {

    @Override
    @EntityGraph(attributePaths = {"customer", "subscription"})
    Page<Invoice> findAll(Specification<Invoice> spec, Pageable pageable);

    @EntityGraph(attributePaths = {"customer", "subscription"})
    List<Invoice> findByCustomerIdOrderByInvoiceDateDesc(Long customerId);

    boolean existsBySubscriptionIdAndPeriodStart(Long subscriptionId, LocalDate periodStart);

    List<Invoice> findByStatus(InvoiceStatus status);

    @Query("select sum(i.total - i.amountPaid) from Invoice i where i.status = com.brightloop.billing.model.InvoiceStatus.CONFIRMED")
    BigDecimal outstandingAmount();

    @Query("select count(i) from Invoice i where i.status = com.brightloop.billing.model.InvoiceStatus.CONFIRMED and i.dueDate < :today")
    long overdueCount(@Param("today") LocalDate today);

    @Query("select sum(i.total - i.amountPaid) from Invoice i where i.status = com.brightloop.billing.model.InvoiceStatus.CONFIRMED and i.dueDate < :today")
    BigDecimal overdueAmount(@Param("today") LocalDate today);
}
