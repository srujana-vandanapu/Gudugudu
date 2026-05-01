package com.tracker.service;

import com.tracker.dto.ExpenseDto;
import com.tracker.model.Category;
import com.tracker.model.Expense;
import com.tracker.model.User;
import com.tracker.repository.CategoryRepository;
import com.tracker.repository.ExpenseRepository;
import com.tracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    // ---- Categories ----

    public List<ExpenseDto.CategoryResponse> getCategories(String phoneNumber) {
        User user = getUser(phoneNumber);
        LocalDateTime[] range = getMonthRange();
        return categoryRepository.findByUserId(user.getId())
            .stream()
            .map(cat -> buildCategoryResponse(cat, range[0], range[1]))
            .collect(Collectors.toList());
    }

    public ExpenseDto.CategoryResponse createCategory(String phoneNumber, ExpenseDto.CategoryRequest req) {
        User user = getUser(phoneNumber);
        Category cat = new Category();
        cat.setName(req.getName());
        cat.setIcon(req.getIcon());
        cat.setColor(req.getColor());
        cat.setEstimatedCost(req.getEstimatedCost());
        cat.setAlertThreshold(req.getAlertThreshold() != null ? req.getAlertThreshold() : BigDecimal.valueOf(80));
        cat.setUser(user);
        categoryRepository.save(cat);
        LocalDateTime[] range = getMonthRange();
        return buildCategoryResponse(cat, range[0], range[1]);
    }

    public ExpenseDto.CategoryResponse updateCategory(String phoneNumber, Long catId, ExpenseDto.CategoryRequest req) {
        User user = getUser(phoneNumber);
        Category cat = categoryRepository.findByIdAndUserId(catId, user.getId())
            .orElseThrow(() -> new RuntimeException("Category not found"));
        cat.setName(req.getName());
        cat.setIcon(req.getIcon());
        cat.setColor(req.getColor());
        cat.setEstimatedCost(req.getEstimatedCost());
        if (req.getAlertThreshold() != null) cat.setAlertThreshold(req.getAlertThreshold());
        categoryRepository.save(cat);
        LocalDateTime[] range = getMonthRange();
        return buildCategoryResponse(cat, range[0], range[1]);
    }

    @Transactional
    public void deleteCategory(String phoneNumber, Long catId) {
        User user = getUser(phoneNumber);
        categoryRepository.findByIdAndUserId(catId, user.getId())
            .orElseThrow(() -> new RuntimeException("Category not found"));
        categoryRepository.deleteByIdAndUserId(catId, user.getId());
    }

    // ---- Expenses ----

    public List<ExpenseDto.ExpenseResponse> getExpenses(String phoneNumber) {
        User user = getUser(phoneNumber);
        return expenseRepository.findByUserIdOrderByExpenseDateDesc(user.getId())
            .stream().map(this::buildExpenseResponse).collect(Collectors.toList());
    }

    public ExpenseDto.ExpenseResponse addExpense(String phoneNumber, ExpenseDto.ExpenseRequest req) {
        User user = getUser(phoneNumber);
        Category cat = categoryRepository.findByIdAndUserId(req.getCategoryId(), user.getId())
            .orElseThrow(() -> new RuntimeException("Category not found"));
        Expense expense = new Expense();
        expense.setTitle(req.getTitle());
        expense.setDescription(req.getDescription());
        expense.setAmount(req.getAmount());
        expense.setExpenseDate(req.getExpenseDate() != null ? req.getExpenseDate() : LocalDateTime.now());
        expense.setCategory(cat);
        expense.setUser(user);
        expenseRepository.save(expense);
        return buildExpenseResponse(expense);
    }

    public ExpenseDto.ExpenseResponse updateExpense(String phoneNumber, Long expId, ExpenseDto.ExpenseRequest req) {
        User user = getUser(phoneNumber);
        Expense expense = expenseRepository.findByIdAndUserId(expId, user.getId())
            .orElseThrow(() -> new RuntimeException("Expense not found"));
        Category cat = categoryRepository.findByIdAndUserId(req.getCategoryId(), user.getId())
            .orElseThrow(() -> new RuntimeException("Category not found"));
        expense.setTitle(req.getTitle());
        expense.setDescription(req.getDescription());
        expense.setAmount(req.getAmount());
        if (req.getExpenseDate() != null) expense.setExpenseDate(req.getExpenseDate());
        expense.setCategory(cat);
        expenseRepository.save(expense);
        return buildExpenseResponse(expense);
    }

    @Transactional
    public void deleteExpense(String phoneNumber, Long expId) {
        User user = getUser(phoneNumber);
        expenseRepository.findByIdAndUserId(expId, user.getId())
            .orElseThrow(() -> new RuntimeException("Expense not found"));
        expenseRepository.deleteById(expId);
    }

    // ---- Dashboard ----

    public ExpenseDto.DashboardResponse getDashboard(String phoneNumber) {
        return getDashboard(phoneNumber, null);
    }

    public ExpenseDto.DashboardResponse getDashboard(String phoneNumber, String month) {
        User user = getUser(phoneNumber);
        YearMonth selectedMonth = parseMonth(month);
        LocalDateTime[] range = getMonthRange(selectedMonth);

        BigDecimal totalSpent = expenseRepository.sumByUserIdAndDateRange(user.getId(), range[0], range[1]);
        BigDecimal monthlyBudget = user.getMonthlyBudget();
        BigDecimal remaining = monthlyBudget.subtract(totalSpent);
        BigDecimal saved = remaining.compareTo(BigDecimal.ZERO) > 0 ? remaining : BigDecimal.ZERO;
        double budgetPct = monthlyBudget.compareTo(BigDecimal.ZERO) > 0
            ? totalSpent.divide(monthlyBudget, 4, RoundingMode.HALF_UP).doubleValue() * 100 : 0;

        List<ExpenseDto.CategoryResponse> categories = categoryRepository.findByUserId(user.getId())
            .stream()
            .map(cat -> buildCategoryResponse(cat, range[0], range[1]))
            .collect(Collectors.toList());

        List<ExpenseDto.ExpenseResponse> recent = expenseRepository
            .findByUserIdAndDateRange(user.getId(), range[0], range[1])
            .stream().limit(10).map(this::buildExpenseResponse).collect(Collectors.toList());

        List<ExpenseDto.AlertInfo> alerts = buildAlerts(categories, budgetPct, monthlyBudget);

        ExpenseDto.DashboardResponse dash = new ExpenseDto.DashboardResponse();
        dash.setMonthlyBudget(monthlyBudget);
        dash.setTotalSpent(totalSpent);
        dash.setTotalSaved(saved);
        dash.setRemainingMoney(remaining);
        dash.setBudgetUsedPercent(Math.min(budgetPct, 100));
        dash.setCategories(categories);
        dash.setRecentExpenses(recent);
        dash.setAlerts(alerts);
        dash.setMonth(selectedMonth.toString());
        return dash;
    }

    public void updateBudget(String phoneNumber, BigDecimal budget) {
        User user = getUser(phoneNumber);
        user.setMonthlyBudget(budget);
        userRepository.save(user);
    }

    // ---- Helpers ----

    private List<ExpenseDto.AlertInfo> buildAlerts(
            List<ExpenseDto.CategoryResponse> categories, double budgetPct, BigDecimal monthlyBudget) {
        List<ExpenseDto.AlertInfo> alerts = new ArrayList<>();

        if (budgetPct >= 100 && monthlyBudget.compareTo(BigDecimal.ZERO) > 0) {
            ExpenseDto.AlertInfo a = new ExpenseDto.AlertInfo();
            a.setType("DANGER");
            a.setMessage("You have exceeded your monthly budget!");
            a.setPercentUsed(budgetPct);
            alerts.add(a);
        } else if (budgetPct >= 80 && monthlyBudget.compareTo(BigDecimal.ZERO) > 0) {
            ExpenseDto.AlertInfo a = new ExpenseDto.AlertInfo();
            a.setType("WARNING");
            a.setMessage(String.format("You've used %.1f%% of your monthly budget", budgetPct));
            a.setPercentUsed(budgetPct);
            alerts.add(a);
        }

        for (ExpenseDto.CategoryResponse cat : categories) {
            if (cat.isOverBudget()) {
                ExpenseDto.AlertInfo a = new ExpenseDto.AlertInfo();
                a.setType("DANGER");
                a.setMessage(String.format("Over budget in %s by ₹%.0f",
                    cat.getName(), cat.getSpentThisMonth().subtract(cat.getEstimatedCost()).doubleValue()));
                a.setCategoryName(cat.getName());
                a.setCategoryIcon(cat.getIcon());
                a.setPercentUsed(cat.getPercentUsed());
                alerts.add(a);
            } else if (cat.isNearAlert()) {
                ExpenseDto.AlertInfo a = new ExpenseDto.AlertInfo();
                a.setType("WARNING");
                a.setMessage(String.format("%.0f%% spent in %s", cat.getPercentUsed(), cat.getName()));
                a.setCategoryName(cat.getName());
                a.setCategoryIcon(cat.getIcon());
                a.setPercentUsed(cat.getPercentUsed());
                alerts.add(a);
            }
        }
        return alerts;
    }

    private ExpenseDto.CategoryResponse buildCategoryResponse(Category cat, LocalDateTime start, LocalDateTime end) {
        BigDecimal spent = expenseRepository.sumByCategoryIdAndDateRange(cat.getId(), start, end);
        BigDecimal estimated = cat.getEstimatedCost();
        BigDecimal remaining = estimated.subtract(spent);
        double pct = estimated.compareTo(BigDecimal.ZERO) > 0
            ? spent.divide(estimated, 4, RoundingMode.HALF_UP).doubleValue() * 100 : 0;

        ExpenseDto.CategoryResponse res = new ExpenseDto.CategoryResponse();
        res.setId(cat.getId());
        res.setName(cat.getName());
        res.setIcon(cat.getIcon());
        res.setColor(cat.getColor());
        res.setEstimatedCost(estimated);
        res.setAlertThreshold(cat.getAlertThreshold());
        res.setSpentThisMonth(spent);
        res.setRemainingBudget(remaining);
        res.setPercentUsed(pct);
        res.setOverBudget(pct > 100);
        res.setNearAlert(pct >= cat.getAlertThreshold().doubleValue() && pct <= 100);
        return res;
    }

    private ExpenseDto.ExpenseResponse buildExpenseResponse(Expense e) {
        ExpenseDto.ExpenseResponse res = new ExpenseDto.ExpenseResponse();
        res.setId(e.getId());
        res.setTitle(e.getTitle());
        res.setDescription(e.getDescription());
        res.setAmount(e.getAmount());
        res.setExpenseDate(e.getExpenseDate());
        res.setCategoryId(e.getCategory().getId());
        res.setCategoryName(e.getCategory().getName());
        res.setCategoryIcon(e.getCategory().getIcon());
        res.setCategoryColor(e.getCategory().getColor());
        res.setCreatedAt(e.getCreatedAt());
        return res;
    }

    private User getUser(String phoneNumber) {
        return userRepository.findByPhoneNumber(phoneNumber)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private LocalDateTime[] getMonthRange() {
        return getMonthRange(YearMonth.now());
    }

    private LocalDateTime[] getMonthRange(YearMonth current) {
        return new LocalDateTime[]{
            current.atDay(1).atStartOfDay(),
            current.atEndOfMonth().atTime(23, 59, 59)
        };
    }

    private YearMonth parseMonth(String month) {
        if (month == null || month.isBlank()) {
            return YearMonth.now();
        }
        return YearMonth.parse(month);
    }
}
