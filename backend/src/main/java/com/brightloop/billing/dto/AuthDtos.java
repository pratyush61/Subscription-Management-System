package com.brightloop.billing.dto;

import com.brightloop.billing.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public final class AuthDtos {

    public static final String PASSWORD_RULE = "^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{9,}$";
    public static final String PASSWORD_MESSAGE =
            "Password must be longer than 8 characters and include an uppercase letter, a lowercase letter and a special character";

    private AuthDtos() {
    }

    public record RegisterRequest(
            @NotBlank(message = "Name is required") String name,
            @NotBlank(message = "Email is required") @Email(message = "Enter a valid email address") String email,
            @NotBlank(message = "Password is required") @Pattern(regexp = PASSWORD_RULE, message = PASSWORD_MESSAGE) String password) {
    }

    public record LoginRequest(
            @NotBlank(message = "Email is required") String email,
            @NotBlank(message = "Password is required") String password) {
    }

    public record ForgotPasswordRequest(@NotBlank(message = "Email is required") String email) {
    }

    public record ResetPasswordRequest(
            @NotBlank String token,
            @NotBlank(message = "Password is required") @Pattern(regexp = PASSWORD_RULE, message = PASSWORD_MESSAGE) String password) {
    }

    public record UserView(Long id, String name, String email, Role role) {
    }

    public record AuthResponse(String token, UserView user) {
    }
}
