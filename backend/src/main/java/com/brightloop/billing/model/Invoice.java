package com.brightloop.billing.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "invoice",
        uniqueConstraints = @UniqueConstraint(name = "uq_invoice_period", columnNames = {"subscription_id", "period_start"}),
        indexes = {
                @Index(name = "idx_inv_status_due", columnList = "status,due_date"),
                @Index(name = "idx_inv_customer", columnList = "customer_id")
        })
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String number;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private Subscription subscription;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private User customer;

    private LocalDate invoiceDate;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "period_start")
    private LocalDate periodStart;

    private LocalDate periodEnd;

    @Enumerated(EnumType.STRING)
    private InvoiceStatus status = InvoiceStatus.DRAFT;

    private BigDecimal subtotal = BigDecimal.ZERO;

    private BigDecimal discountAmount = BigDecimal.ZERO;

    private String discountLabel;

    private BigDecimal taxAmount = BigDecimal.ZERO;

    private BigDecimal total = BigDecimal.ZERO;

    private BigDecimal amountPaid = BigDecimal.ZERO;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "invoice_id")
    private List<InvoiceLine> lines = new ArrayList<>();

    public BigDecimal balance() {
        return total.subtract(amountPaid);
    }
}
