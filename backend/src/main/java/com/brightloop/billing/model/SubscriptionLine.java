package com.brightloop.billing.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class SubscriptionLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private Product product;

    private Long variantId;

    private String variantLabel;

    private int quantity;

    private BigDecimal unitPrice;

    @ManyToOne
    private Tax tax;

    public BigDecimal amount() {
        return unitPrice.multiply(BigDecimal.valueOf(quantity));
    }
}
