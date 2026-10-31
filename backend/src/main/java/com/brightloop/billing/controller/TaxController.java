package com.brightloop.billing.controller;

import com.brightloop.billing.exception.ApiException;
import com.brightloop.billing.model.Tax;
import com.brightloop.billing.repository.TaxRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/taxes")
@RequiredArgsConstructor
public class TaxController {

    private final TaxRepository taxes;

    @GetMapping
    public List<Tax> list() {
        return taxes.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Tax create(@Valid @RequestBody Tax body) {
        body.setId(null);
        return taxes.save(body);
    }

    @PutMapping("/{id}")
    public Tax update(@PathVariable Long id, @Valid @RequestBody Tax body) {
        Tax tax = taxes.findById(id).orElseThrow(() -> ApiException.notFound("Tax"));
        tax.setName(body.getName());
        tax.setRate(body.getRate());
        return taxes.save(tax);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        taxes.deleteById(id);
    }
}
