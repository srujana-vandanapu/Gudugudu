package com.tracker.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ExpenseDto {

    @Data
    public static class CategoryRequest {
        @NotBlank
        private String name;
        private String icon;
        private String color;
        @NotNull
        private BigDecimal estimatedCost;
        private BigDecimal alertThreshold = BigDecimal.valueOf(80);
    }

    @Data
    public static class CategoryResponse {
        private Long id;
        private String name;
        private String icon;
        private String color;
        private BigDecimal estimatedCost;
        private BigDecimal alertThreshold;
        private BigDecimal spentThisMonth;
        private BigDecimal remainingBudget;
        private double percentUsed;
        private boolean isOverBudget;
        private boolean isNearAlert;
    }

    @Data
    public static class ExpenseRequest {
        @NotBlank
        private String title;
        private String description;
        @NotNull
        @Positive
        private BigDecimal amount;
        @NotNull
        private Long categoryId;
        private LocalDateTime expenseDate;
    }

    @Data
    public static class ExpenseResponse {
        private Long id;
        private String title;
        private String description;
        private BigDecimal amount;
        private LocalDateTime expenseDate;
        private Long categoryId;
        private String categoryName;
        private String categoryIcon;
        private String categoryColor;
        private LocalDateTime createdAt;
    }

    @Data
    public static class DashboardResponse {
        private BigDecimal monthlyBudget;
        private BigDecimal totalSpent;
        private BigDecimal totalSaved;
        private BigDecimal remainingMoney;
        private double budgetUsedPercent;
        private java.util.List<CategoryResponse> categories;
        private java.util.List<ExpenseResponse> recentExpenses;
        private java.util.List<AlertInfo> alerts;
        private String month;
    }

    @Data
    public static class AlertInfo {
        private String type; // WARNING, DANGER, INFO
        private String message;
        private String categoryName;
        private String categoryIcon;
        private double percentUsed;
    }

    @Data
    public static class BudgetUpdateRequest {
        @NotNull
        @Positive
        private BigDecimal monthlyBudget;
    }
}
