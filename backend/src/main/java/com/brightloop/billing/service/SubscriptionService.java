package com.brightloop.billing.service;

import com.brightloop.billing.dto.Mapper;
import com.brightloop.billing.dto.PageResponse;
import com.brightloop.billing.dto.SubscriptionDtos.*;
import com.brightloop.billing.exception.ApiException;
import com.brightloop.billing.model.*;
import com.brightloop.billing.repository.*;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private static final Map<SubscriptionStatus, Set<SubscriptionStatus>> ALLOWED = Map.of(
            SubscriptionStatus.DRAFT, Set.of(SubscriptionStatus.QUOTATION, SubscriptionStatus.CLOSED),
            SubscriptionStatus.QUOTATION, Set.of(SubscriptionStatus.CONFIRMED, SubscriptionStatus.DRAFT, SubscriptionStatus.CLOSED),
            SubscriptionStatus.CONFIRMED, Set.of(SubscriptionStatus.ACTIVE, SubscriptionStatus.CLOSED),
            SubscriptionStatus.ACTIVE, Set.of(SubscriptionStatus.PAUSED, SubscriptionStatus.CLOSED),
            SubscriptionStatus.PAUSED, Set.of(SubscriptionStatus.ACTIVE, SubscriptionStatus.CLOSED),
            SubscriptionStatus.CLOSED, Set.of());

    private final SubscriptionRepository subscriptions;
    private final UserRepository users;
    private final PlanRepository plans;
    private final ProductRepository products;
    private final TaxRepository taxes;
    private final DiscountRepository discounts;
    private final QuotationTemplateRepository templates;

    @Transactional
    public SubscriptionDetail create(SubscriptionRequest request) {
        Subscription sub = new Subscription();
        fill(sub, request);
        Subscription saved = subscriptions.save(sub);
        saved.setNumber(String.format("SUB%05d", saved.getId()));
        return Mapper.detail(saved);
    }

    @Transactional
    public SubscriptionDetail update(Long id, SubscriptionRequest request) {
        Subscription sub = find(id);
        if (sub.getStatus() != SubscriptionStatus.DRAFT && sub.getStatus() != SubscriptionStatus.QUOTATION) {
            throw ApiException.badRequest("Only draft or quotation subscriptions can be edited");
        }
        fill(sub, request);
        return Mapper.detail(sub);
    }

    @Transactional(readOnly = true)
    public PageResponse<SubscriptionRow> list(SubscriptionStatus status, String search, int page, int size) {
        Specification<Subscription> spec = (root, query, cb) -> {
            List<Predicate> filters = new ArrayList<>();
            if (status != null) {
                filters.add(cb.equal(root.get("status"), status));
            }
            if (search != null && !search.isBlank()) {
                String like = "%" + search.trim().toLowerCase() + "%";
                filters.add(cb.or(cb.like(cb.lower(root.get("number")), like),
                        cb.like(cb.lower(root.get("customer").get("name")), like)));
            }
            return cb.and(filters.toArray(new Predicate[0]));
        };
        PageRequest pageable = PageRequest.of(page, Math.min(size, 100), Sort.by(Sort.Direction.DESC, "id"));
        return PageResponse.of(subscriptions.findAll(spec, pageable), Mapper::row);
    }

    @Transactional(readOnly = true)
    public SubscriptionDetail detail(Long id) {
        return Mapper.detail(find(id));
    }

    @Transactional(readOnly = true)
    public List<SubscriptionDetail> forCustomer(Long customerId) {
        return subscriptions.findByCustomerIdOrderByCreatedAtDesc(customerId).stream().map(Mapper::detail).toList();
    }

    @Transactional
    public SubscriptionDetail move(Long id, SubscriptionStatus target) {
        Subscription sub = find(id);
        SubscriptionStatus current = sub.getStatus();
        if (!ALLOWED.get(current).contains(target)) {
            throw ApiException.badRequest("A " + current.name().toLowerCase() + " subscription cannot move to " + target.name().toLowerCase());
        }
        Plan plan = sub.getPlan();
        boolean running = current == SubscriptionStatus.ACTIVE || current == SubscriptionStatus.PAUSED;
        if (target == SubscriptionStatus.PAUSED && !plan.isPausable()) {
            throw ApiException.badRequest("This plan cannot be paused");
        }
        if (target == SubscriptionStatus.CLOSED && running && !plan.isClosable()) {
            throw ApiException.badRequest("This plan cannot be closed early");
        }
        if (target == SubscriptionStatus.CONFIRMED && sub.getQuotationValidUntil() != null
                && sub.getQuotationValidUntil().isBefore(LocalDate.now())) {
            throw ApiException.badRequest("This quotation expired on " + sub.getQuotationValidUntil());
        }
        if (target == SubscriptionStatus.ACTIVE && current == SubscriptionStatus.CONFIRMED) {
            sub.setNextBillingDate(sub.getStartDate());
        }
        sub.setStatus(target);
        return Mapper.detail(sub);
    }

    @Transactional
    public SubscriptionDetail renew(Long id) {
        Subscription sub = find(id);
        if (!sub.getPlan().isRenewable()) {
            throw ApiException.badRequest("This plan cannot be renewed");
        }
        if (sub.getStatus() != SubscriptionStatus.ACTIVE && sub.getStatus() != SubscriptionStatus.CLOSED) {
            throw ApiException.badRequest("Only active or closed subscriptions can be renewed");
        }
        LocalDate base = sub.getExpiryDate() != null ? sub.getExpiryDate() : LocalDate.now();
        long length = sub.getExpiryDate() != null ? Math.max(1, ChronoUnit.DAYS.between(sub.getStartDate(), sub.getExpiryDate())) : 30;
        sub.setExpiryDate(base.isBefore(LocalDate.now()) ? LocalDate.now().plusDays(length) : base.plusDays(length));
        if (sub.getStatus() == SubscriptionStatus.CLOSED) {
            sub.setStatus(SubscriptionStatus.ACTIVE);
            sub.setNextBillingDate(LocalDate.now());
        }
        return Mapper.detail(sub);
    }

    @Transactional(readOnly = true)
    public Long ownerId(Long id) {
        return find(id).getCustomer().getId();
    }

    public Subscription find(Long id) {
        return subscriptions.findById(id).orElseThrow(() -> ApiException.notFound("Subscription"));
    }

    private void fill(Subscription sub, SubscriptionRequest r) {
        User customer = users.findById(r.customerId())
                .filter(u -> u.getRole() == Role.CUSTOMER)
                .orElseThrow(() -> ApiException.badRequest("Choose a valid customer"));
        Plan plan = plans.findById(r.planId()).orElseThrow(() -> ApiException.badRequest("Choose a valid plan"));

        boolean available = plan.isActive()
                && (plan.getStartDate() == null || !r.startDate().isBefore(plan.getStartDate()))
                && (plan.getEndDate() == null || !r.startDate().isAfter(plan.getEndDate()));
        if (!available) {
            throw ApiException.badRequest("This plan is not available on the chosen start date");
        }
        if (r.expiryDate() != null && r.expiryDate().isBefore(r.startDate())) {
            throw ApiException.badRequest("Expiry date must be after the start date");
        }

        sub.setCustomer(customer);
        sub.setPlan(plan);
        sub.setStartDate(r.startDate());
        sub.setExpiryDate(r.expiryDate());
        sub.setPaymentTerms(r.paymentTerms() == null || r.paymentTerms().isBlank() ? "Immediate" : r.paymentTerms());
        sub.setDiscount(r.discountId() == null ? null : discounts.findById(r.discountId())
                .orElseThrow(() -> ApiException.badRequest("Choose a valid discount")));
        if (r.templateId() != null) {
            QuotationTemplate template = templates.findById(r.templateId())
                    .orElseThrow(() -> ApiException.badRequest("Choose a valid template"));
            sub.setQuotationValidUntil(LocalDate.now().plusDays(template.getValidityDays()));
        }

        sub.getLines().clear();
        BigDecimal recurring = BigDecimal.ZERO;
        for (LineRequest lr : r.lines()) {
            if (lr.quantity() < plan.getMinQuantity()) {
                throw ApiException.badRequest("This plan needs a minimum quantity of " + plan.getMinQuantity());
            }
            Product product = products.findById(lr.productId())
                    .orElseThrow(() -> ApiException.badRequest("One of the products no longer exists"));
            BigDecimal price = product.getSalesPrice();
            String label = null;
            Long variantId = null;
            if (lr.variantId() != null) {
                ProductVariant variant = product.getVariants().stream()
                        .filter(v -> v.getId().equals(lr.variantId())).findFirst()
                        .orElseThrow(() -> ApiException.badRequest("That variant does not belong to " + product.getName()));
                price = price.add(variant.getExtraPrice());
                label = variant.getAttribute() + ": " + variant.getValue();
                variantId = variant.getId();
            }
            SubscriptionLine line = new SubscriptionLine();
            line.setProduct(product);
            line.setVariantId(variantId);
            line.setVariantLabel(label);
            line.setQuantity(lr.quantity());
            line.setUnitPrice(price);
            line.setTax(lr.taxId() == null ? null : taxes.findById(lr.taxId())
                    .orElseThrow(() -> ApiException.badRequest("Choose a valid tax")));
            sub.getLines().add(line);
            recurring = recurring.add(line.amount());
        }
        sub.setRecurringAmount(recurring);
    }
}
