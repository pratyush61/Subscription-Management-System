package com.brightloop.billing.repository;

import com.brightloop.billing.model.Discount;
import com.brightloop.billing.model.DiscountTarget;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DiscountRepository extends JpaRepository<Discount, Long> {

    List<Discount> findByActiveTrueAndTarget(DiscountTarget target);
}
