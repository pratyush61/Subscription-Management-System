package com.brightloop.billing.controller;

import com.brightloop.billing.exception.ApiException;
import com.brightloop.billing.model.Discount;
import com.brightloop.billing.model.DiscountTarget;
import com.brightloop.billing.model.DiscountType;
import com.brightloop.billing.repository.DiscountRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/discounts")
@RequiredArgsConstructor
public class DiscountController {

    private final DiscountRepository discounts;

    @GetMapping
    public List<Discount> list() {
        return discounts.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Discount create(@Valid @RequestBody Discount body) {
        check(body);
        body.setId(null);
        body.setUsedCount(0);
        return discounts.save(body);
    }

    @PutMapping("/{id}")
    public Discount update(@PathVariable Long id, @Valid @RequestBody Discount body) {
        check(body);
        Discount existing = discounts.findById(id).orElseThrow(() -> ApiException.notFound("Discount"));
        body.setId(id);
        body.setUsedCount(existing.getUsedCount());
        return discounts.save(body);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        discounts.deleteById(id);
    }

    private void check(Discount d) {
        if (d.getType() == DiscountType.PERCENTAGE && d.getValue().compareTo(BigDecimal.valueOf(100)) > 0) {
            throw ApiException.badRequest("A percentage discount cannot be more than 100");
        }
        if (d.getTarget() == DiscountTarget.PRODUCT && (d.getProduct() == null || d.getProduct().getId() == null)) {
            throw ApiException.badRequest("Choose the product this discount applies to");
        }
        if (d.getTarget() == DiscountTarget.SUBSCRIPTION) {
            d.setProduct(null);
        }
        if (d.getStartDate() != null && d.getEndDate() != null && d.getEndDate().isBefore(d.getStartDate())) {
            throw ApiException.badRequest("Discount end date must be after its start date");
        }
    }
}
