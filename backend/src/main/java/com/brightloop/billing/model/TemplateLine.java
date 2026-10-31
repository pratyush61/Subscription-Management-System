package com.brightloop.billing.model;

import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
public class TemplateLine {

    private Long productId;

    private Integer quantity = 1;
}
