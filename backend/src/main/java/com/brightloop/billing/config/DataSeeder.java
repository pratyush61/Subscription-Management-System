package com.brightloop.billing.config;

import com.brightloop.billing.model.*;
import com.brightloop.billing.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository users;
    private final TaxRepository taxes;
    private final ProductRepository products;
    private final PlanRepository plans;
    private final PasswordEncoder encoder;

    @Override
    public void run(String... args) {
        if (users.count() > 0) {
            return;
        }
        createUser("Brightloop Admin", "admin@brightloop.com", "Admin@12345", Role.ADMIN);
        createUser("Priya Sharma", "staff@brightloop.com", "Staff@12345", Role.STAFF);
        createUser("Northwind Traders", "customer@brightloop.com", "Customer@123", Role.CUSTOMER);

        Tax gst = new Tax();
        gst.setName("GST 18%");
        gst.setRate(new BigDecimal("18"));
        taxes.save(gst);

        Product crm = new Product();
        crm.setName("Brightloop CRM");
        crm.setType("Software");
        crm.setSalesPrice(new BigDecimal("1200"));
        crm.setCostPrice(new BigDecimal("400"));
        crm.setNotes("Customer relationship suite for small teams");
        crm.getVariants().add(variant("Brand", "Odoo", "560"));
        crm.getVariants().add(variant("Brand", "Zoho", "320"));
        products.save(crm);

        Product support = new Product();
        support.setName("Priority Support");
        support.setType("Add-on");
        support.setSalesPrice(new BigDecimal("300"));
        support.setCostPrice(new BigDecimal("90"));
        products.save(support);

        Plan monthly = new Plan();
        monthly.setName("Business Monthly");
        monthly.setPrice(new BigDecimal("1500"));
        monthly.setBillingPeriod(BillingPeriod.MONTHLY);
        monthly.setStartDate(LocalDate.now().minusMonths(1));
        plans.save(monthly);

        Plan yearly = new Plan();
        yearly.setName("Enterprise Yearly");
        yearly.setPrice(new BigDecimal("15000"));
        yearly.setBillingPeriod(BillingPeriod.YEARLY);
        yearly.setMinQuantity(5);
        yearly.setAutoClose(true);
        yearly.setPausable(false);
        plans.save(yearly);
    }

    private void createUser(String name, String email, String password, Role role) {
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(encoder.encode(password));
        user.setRole(role);
        users.save(user);
    }

    private ProductVariant variant(String attribute, String value, String extra) {
        ProductVariant v = new ProductVariant();
        v.setAttribute(attribute);
        v.setValue(value);
        v.setExtraPrice(new BigDecimal(extra));
        return v;
    }
}
