package com.brightloop.billing.repository;

import com.brightloop.billing.model.Role;
import com.brightloop.billing.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    List<User> findByRoleInOrderByNameAsc(List<Role> roles);

    List<User> findByRoleOrderByNameAsc(Role role);
}
