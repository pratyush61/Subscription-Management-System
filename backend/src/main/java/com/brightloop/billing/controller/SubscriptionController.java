package com.brightloop.billing.controller;

import com.brightloop.billing.dto.PageResponse;
import com.brightloop.billing.dto.SubscriptionDtos.*;
import com.brightloop.billing.model.SubscriptionStatus;
import com.brightloop.billing.service.SubscriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService service;

    @GetMapping
    public PageResponse<SubscriptionRow> list(@RequestParam(required = false) SubscriptionStatus status,
                                              @RequestParam(required = false) String search,
                                              @RequestParam(defaultValue = "0") int page,
                                              @RequestParam(defaultValue = "10") int size) {
        return service.list(status, search, page, size);
    }

    @GetMapping("/{id}")
    public SubscriptionDetail get(@PathVariable Long id) {
        return service.detail(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SubscriptionDetail create(@Valid @RequestBody SubscriptionRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public SubscriptionDetail update(@PathVariable Long id, @Valid @RequestBody SubscriptionRequest request) {
        return service.update(id, request);
    }

    @PostMapping("/{id}/status")
    public SubscriptionDetail move(@PathVariable Long id, @RequestParam SubscriptionStatus to) {
        return service.move(id, to);
    }

    @PostMapping("/{id}/renew")
    public SubscriptionDetail renew(@PathVariable Long id) {
        return service.renew(id);
    }
}
