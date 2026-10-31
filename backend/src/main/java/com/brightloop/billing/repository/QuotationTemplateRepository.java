package com.brightloop.billing.repository;

import com.brightloop.billing.model.QuotationTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuotationTemplateRepository extends JpaRepository<QuotationTemplate, Long> {
}
