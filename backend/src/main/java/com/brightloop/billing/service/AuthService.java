package com.brightloop.billing.service;

import com.brightloop.billing.dto.AuthDtos.*;
import com.brightloop.billing.exception.ApiException;
import com.brightloop.billing.model.PasswordResetToken;
import com.brightloop.billing.model.Role;
import com.brightloop.billing.model.User;
import com.brightloop.billing.repository.PasswordResetTokenRepository;
import com.brightloop.billing.repository.UserRepository;
import com.brightloop.billing.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository users;
    private final PasswordResetTokenRepository resetTokens;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;
    private final EmailService emailService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public UserView view(User u) {
        return new UserView(u.getId(), u.getName(), u.getEmail(), u.getRole());
    }

    public AuthResponse register(RegisterRequest request) {
        UserView created = createAccount(request, Role.CUSTOMER);
        User user = users.findById(created.id()).orElseThrow();
        return new AuthResponse(jwtService.generate(user), created);
    }

    private UserView createAccount(RegisterRequest request, Role role) {
        String email = request.email().trim().toLowerCase();
        if (users.existsByEmailIgnoreCase(email)) {
            throw ApiException.conflict("An account with this email already exists");
        }
        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(email);
        user.setPassword(encoder.encode(request.password()));
        user.setRole(role);
        return view(users.save(user));
    }

    public UserView createStaff(RegisterRequest request) {
        return createAccount(request, Role.STAFF);
    }

    public AuthResponse login(LoginRequest request) {
        User user = users.findByEmailIgnoreCase(request.email().trim())
                .filter(u -> encoder.matches(request.password(), u.getPassword()))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Email or password is incorrect"));
        return new AuthResponse(jwtService.generate(user), view(user));
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        users.findByEmailIgnoreCase(request.email().trim()).ifPresent(user -> {
            PasswordResetToken token = new PasswordResetToken();
            token.setToken(UUID.randomUUID().toString());
            token.setUser(user);
            token.setExpiresAt(LocalDateTime.now().plusMinutes(30));
            resetTokens.save(token);
            String link = frontendUrl + "/reset-password?token=" + token.getToken();
            emailService.send(user.getEmail(), "Reset your Brightloop password",
                    "Hi " + user.getName() + ",\n\nUse the link below to choose a new password. It works for 30 minutes.\n\n"
                            + link + "\n\nIf you did not ask for this, you can ignore this email.");
        });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken token = resetTokens.findByToken(request.token())
                .filter(t -> !t.isUsed() && t.getExpiresAt().isAfter(LocalDateTime.now()))
                .orElseThrow(() -> ApiException.badRequest("This reset link is invalid or has expired"));
        token.getUser().setPassword(encoder.encode(request.password()));
        token.setUsed(true);
    }
}
