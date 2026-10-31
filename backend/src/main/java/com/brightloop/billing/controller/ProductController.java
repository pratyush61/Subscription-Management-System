package com.brightloop.billing.controller;

import com.brightloop.billing.exception.ApiException;
import com.brightloop.billing.model.Product;
import com.brightloop.billing.repository.ProductRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductRepository products;

    @GetMapping
    public List<Product> list() {
        return products.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Product create(@Valid @RequestBody Product body) {
        body.setId(null);
        body.getVariants().forEach(v -> v.setId(null));
        return products.save(body);
    }

    @PutMapping("/{id}")
    @Transactional
    public Product update(@PathVariable Long id, @Valid @RequestBody Product body) {
        Product product = products.findById(id).orElseThrow(() -> ApiException.notFound("Product"));
        product.setName(body.getName());
        product.setType(body.getType());
        product.setSalesPrice(body.getSalesPrice());
        product.setCostPrice(body.getCostPrice());
        product.setNotes(body.getNotes());
        product.getVariants().clear();
        body.getVariants().forEach(v -> v.setId(null));
        product.getVariants().addAll(body.getVariants());
        return products.save(product);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        products.deleteById(id);
    }
}
