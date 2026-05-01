package com.tracker.controller;

import com.tracker.dto.ExpenseDto;
import com.tracker.service.ExpenseService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;

    // ---- Dashboard ----
    @GetMapping("/dashboard")
    public ResponseEntity<ExpenseDto.DashboardResponse> getDashboard(
            @AuthenticationPrincipal UserDetails user,
            @RequestParam(required = false) String month) {
        return ResponseEntity.ok(expenseService.getDashboard(user.getUsername(), month));
    }

    @PutMapping("/budget")
    public ResponseEntity<?> updateBudget(@AuthenticationPrincipal UserDetails user,
                                          @Valid @RequestBody ExpenseDto.BudgetUpdateRequest req) {
        expenseService.updateBudget(user.getUsername(), req.getMonthlyBudget());
        return ResponseEntity.ok(Map.of("message", "Budget updated"));
    }

    // ---- Categories ----
    @GetMapping("/categories")
    public ResponseEntity<List<ExpenseDto.CategoryResponse>> getCategories(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(expenseService.getCategories(user.getUsername()));
    }

    @PostMapping("/categories")
    public ResponseEntity<?> createCategory(@AuthenticationPrincipal UserDetails user,
                                            @Valid @RequestBody ExpenseDto.CategoryRequest req) {
        try {
            return ResponseEntity.ok(expenseService.createCategory(user.getUsername(), req));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<?> updateCategory(@AuthenticationPrincipal UserDetails user,
                                            @PathVariable Long id,
                                            @Valid @RequestBody ExpenseDto.CategoryRequest req) {
        try {
            return ResponseEntity.ok(expenseService.updateCategory(user.getUsername(), id, req));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<?> deleteCategory(@AuthenticationPrincipal UserDetails user, @PathVariable Long id) {
        try {
            expenseService.deleteCategory(user.getUsername(), id);
            return ResponseEntity.ok(Map.of("message", "Category deleted"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ---- Expenses ----
    @GetMapping("/expenses")
    public ResponseEntity<List<ExpenseDto.ExpenseResponse>> getExpenses(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(expenseService.getExpenses(user.getUsername()));
    }

    @PostMapping("/expenses")
    public ResponseEntity<?> addExpense(@AuthenticationPrincipal UserDetails user,
                                        @Valid @RequestBody ExpenseDto.ExpenseRequest req) {
        try {
            return ResponseEntity.ok(expenseService.addExpense(user.getUsername(), req));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/expenses/{id}")
    public ResponseEntity<?> updateExpense(@AuthenticationPrincipal UserDetails user,
                                           @PathVariable Long id,
                                           @Valid @RequestBody ExpenseDto.ExpenseRequest req) {
        try {
            return ResponseEntity.ok(expenseService.updateExpense(user.getUsername(), id, req));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/expenses/{id}")
    public ResponseEntity<?> deleteExpense(@AuthenticationPrincipal UserDetails user, @PathVariable Long id) {
        try {
            expenseService.deleteExpense(user.getUsername(), id);
            return ResponseEntity.ok(Map.of("message", "Expense deleted"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
