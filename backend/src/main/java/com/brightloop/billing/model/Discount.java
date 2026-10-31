package com.brightloop.billing.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Discount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String name;

    @NotNull
    @Enumerated(EnumType.STRING)
    private DiscountType type;

    @NotNull
    @Positive
    @Column(name = "discount_value")
    private BigDecimal value;

    @Enumerated(EnumType.STRING)
    @NotNull
    private DiscountTarget target = DiscountTarget.SUBSCRIPTION;

    @ManyToOne
    private Product product;

    private BigDecimal minPurchase;

    private Integer minQuantity;

    private LocalDate startDate;

    private LocalDate endDate;

    private Integer usageLimit;

    private int usedCount;

    private boolean active = true;
}
