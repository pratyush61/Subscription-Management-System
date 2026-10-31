package com.brightloop.billing.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "payment", indexes = @Index(name = "idx_pay_date", columnList = "payment_date"))
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private Invoice invoice;

    @Enumerated(EnumType.STRING)
    private PaymentMethod method;

    private BigDecimal amount;

    @Column(name = "payment_date")
    private LocalDate paymentDate;

    private String note;
}
