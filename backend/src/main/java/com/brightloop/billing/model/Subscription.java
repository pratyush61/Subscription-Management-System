package com.brightloop.billing.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "subscription", indexes = {
        @Index(name = "idx_sub_status", columnList = "status"),
        @Index(name = "idx_sub_billing", columnList = "status,next_billing_date")
})
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String number;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private User customer;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private Plan plan;

    private LocalDate startDate;

    private LocalDate expiryDate;

    private String paymentTerms;

    @Enumerated(EnumType.STRING)
    private SubscriptionStatus status = SubscriptionStatus.DRAFT;

    @Column(name = "next_billing_date")
    private LocalDate nextBillingDate;

    private LocalDate quotationValidUntil;

    @ManyToOne(fetch = FetchType.LAZY)
    private Discount discount;

    private BigDecimal recurringAmount = BigDecimal.ZERO;

    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "subscription_id")
    private List<SubscriptionLine> lines = new ArrayList<>();
}
