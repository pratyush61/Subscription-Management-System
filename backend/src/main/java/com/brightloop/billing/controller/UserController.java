package com.brightloop.billing.controller;

import com.brightloop.billing.dto.AuthDtos.RegisterRequest;
import com.brightloop.billing.dto.AuthDtos.UserView;
import com.brightloop.billing.model.Role;
import com.brightloop.billing.repository.UserRepository;
import com.brightloop.billing.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository users;
    private final AuthService authService;

    @GetMapping("/customers")
    public List<UserView> customers() {
        return users.findByRoleOrderByNameAsc(Role.CUSTOMER).stream().map(authService::view).toList();
    }

    @GetMapping("/team")
    public List<UserView> team() {
        return users.findByRoleInOrderByNameAsc(List.of(Role.ADMIN, Role.STAFF)).stream().map(authService::view).toList();
    }

    @PostMapping("/staff")
    @ResponseStatus(HttpStatus.CREATED)
    public UserView addStaff(@Valid @RequestBody RegisterRequest request) {
        return authService.createStaff(request);
    }
}
