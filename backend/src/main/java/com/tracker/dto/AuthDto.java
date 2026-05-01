package com.tracker.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public class AuthDto {

    @Data
    public static class RegisterRequest {
        @NotBlank
        private String name;

        @NotBlank
        @Pattern(regexp = "^[0-9]{10,15}$", message = "Invalid phone number")
        private String phoneNumber;

        @NotBlank
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;

        private BigDecimal monthlyBudget = BigDecimal.ZERO;
    }

    @Data
    public static class LoginRequest {
        @NotBlank
        private String phoneNumber;

        @NotBlank
        private String password;
    }

    @Data
    public static class AuthResponse {
        private String token;
        private String name;
        private String phoneNumber;
        private BigDecimal monthlyBudget;

        public AuthResponse(String token, String name, String phoneNumber, BigDecimal monthlyBudget) {
            this.token = token;
            this.name = name;
            this.phoneNumber = phoneNumber;
            this.monthlyBudget = monthlyBudget;
        }
    }
}
