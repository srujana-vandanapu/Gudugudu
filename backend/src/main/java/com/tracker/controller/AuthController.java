package com.tracker.controller;

import com.tracker.dto.AuthDto;
import com.tracker.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody AuthDto.RegisterRequest request) {
        try {
            AuthDto.AuthResponse response = authService.register(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            if ("Phone number already registered".equals(e.getMessage())) {
                return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
            }
            return ResponseEntity.internalServerError().body(Map.of("error", "Registration is temporarily unavailable. Please try again later."));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthDto.LoginRequest request) {
        try {
            AuthDto.AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid phone number or password"));
        }
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
            .findFirst()
            .map(this::formatValidationError)
            .orElse("Invalid request");
        return ResponseEntity.badRequest().body(Map.of("error", message));
    }

    private String formatValidationError(FieldError error) {
        String defaultMessage = error.getDefaultMessage();
        if (defaultMessage != null && !defaultMessage.isBlank()) {
            return defaultMessage;
        }
        return error.getField() + " is invalid";
    }
}
