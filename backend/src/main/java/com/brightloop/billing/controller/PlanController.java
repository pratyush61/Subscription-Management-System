package com.brightloop.billing.controller;

import com.brightloop.billing.exception.ApiException;
import com.brightloop.billing.model.Plan;
import com.brightloop.billing.repository.PlanRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/plans")
@RequiredArgsConstructor
public class PlanController {

    private final PlanRepository plans;

    @GetMapping
    public List<Plan> list() {
        return plans.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Plan create(@Valid @RequestBody Plan body) {
        check(body);
        body.setId(null);
        return plans.save(body);
    }

    @PutMapping("/{id}")
    public Plan update(@PathVariable Long id, @Valid @RequestBody Plan body) {
        check(body);
        plans.findById(id).orElseThrow(() -> ApiException.notFound("Plan"));
        body.setId(id);
        return plans.save(body);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        plans.deleteById(id);
    }

    private void check(Plan plan) {
        if (plan.getStartDate() != null && plan.getEndDate() != null && plan.getEndDate().isBefore(plan.getStartDate())) {
            throw ApiException.badRequest("Plan end date must be after its start date");
        }
    }
}
