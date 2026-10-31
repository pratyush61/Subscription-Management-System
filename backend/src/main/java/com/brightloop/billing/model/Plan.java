package com.brightloop.billing.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Plan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String name;

    @NotNull
    @PositiveOrZero
    private BigDecimal price;

    @NotNull
    @Enumerated(EnumType.STRING)
    private BillingPeriod billingPeriod;

    @Min(1)
    private int minQuantity = 1;

    private LocalDate startDate;

    private LocalDate endDate;

    private boolean autoClose;

    private boolean closable = true;

    private boolean pausable = true;

    private boolean renewable = true;

    private boolean active = true;
}
