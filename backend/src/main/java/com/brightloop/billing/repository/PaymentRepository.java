package com.brightloop.billing.repository;

import com.brightloop.billing.model.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    @Override
    @EntityGraph(attributePaths = {"invoice", "invoice.customer"})
    Page<Payment> findAll(Pageable pageable);

    List<Payment> findByInvoiceIdOrderByPaymentDateDesc(Long invoiceId);

    @Query("select sum(p.amount) from Payment p")
    BigDecimal totalCollected();

    @Query("select year(p.paymentDate), month(p.paymentDate), sum(p.amount) from Payment p " +
            "where p.paymentDate >= :from group by year(p.paymentDate), month(p.paymentDate)")
    List<Object[]> monthlyTotals(@Param("from") LocalDate from);
}
