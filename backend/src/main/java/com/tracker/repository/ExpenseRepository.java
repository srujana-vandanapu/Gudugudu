package com.tracker.repository;

import com.tracker.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByUserIdOrderByExpenseDateDesc(Long userId);

    Optional<Expense> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT e FROM Expense e WHERE e.user.id = :userId " +
           "AND e.expenseDate BETWEEN :start AND :end ORDER BY e.expenseDate DESC")
    List<Expense> findByUserIdAndDateRange(
        @Param("userId") Long userId,
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end
    );

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.user.id = :userId " +
           "AND e.expenseDate BETWEEN :start AND :end")
    BigDecimal sumByUserIdAndDateRange(
        @Param("userId") Long userId,
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end
    );

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.category.id = :categoryId " +
           "AND e.expenseDate BETWEEN :start AND :end")
    BigDecimal sumByCategoryIdAndDateRange(
        @Param("categoryId") Long categoryId,
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end
    );

    List<Expense> findByUserIdAndCategoryIdOrderByExpenseDateDesc(Long userId, Long categoryId);
}
