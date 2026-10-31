package com.brightloop.billing.controller;

import com.brightloop.billing.exception.ApiException;
import com.brightloop.billing.model.QuotationTemplate;
import com.brightloop.billing.repository.QuotationTemplateRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/templates")
@RequiredArgsConstructor
public class TemplateController {

    private final QuotationTemplateRepository templates;

    @GetMapping
    public List<QuotationTemplate> list() {
        return templates.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public QuotationTemplate create(@Valid @RequestBody QuotationTemplate body) {
        body.setId(null);
        return templates.save(body);
    }

    @PutMapping("/{id}")
    public QuotationTemplate update(@PathVariable Long id, @Valid @RequestBody QuotationTemplate body) {
        templates.findById(id).orElseThrow(() -> ApiException.notFound("Template"));
        body.setId(id);
        return templates.save(body);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        templates.deleteById(id);
    }
}
