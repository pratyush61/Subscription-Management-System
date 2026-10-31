package com.brightloop.billing.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class QuotationTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String name;

    @Min(1)
    private int validityDays = 30;

    @ManyToOne
    private Plan plan;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "quotation_template_lines", joinColumns = @JoinColumn(name = "template_id"))
    private List<TemplateLine> lines = new ArrayList<>();
}
