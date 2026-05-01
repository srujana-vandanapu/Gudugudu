package com.tracker.service;

import com.tracker.dto.AuthDto;
import com.tracker.model.Category;
import com.tracker.model.User;
import com.tracker.repository.CategoryRepository;
import com.tracker.repository.UserRepository;
import com.tracker.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new RuntimeException("Phone number already registered");
        }

        User user = new User();
        user.setName(request.getName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setMonthlyBudget(request.getMonthlyBudget() != null ? request.getMonthlyBudget() : BigDecimal.ZERO);
        userRepository.save(user);

        // Create default categories
        createDefaultCategories(user);

        String token = jwtUtil.generateToken(user.getPhoneNumber());
        return new AuthDto.AuthResponse(token, user.getName(), user.getPhoneNumber(), user.getMonthlyBudget());
    }

    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getPhoneNumber(), request.getPassword())
        );
        User user = userRepository.findByPhoneNumber(request.getPhoneNumber())
            .orElseThrow(() -> new RuntimeException("User not found"));
        String token = jwtUtil.generateToken(user.getPhoneNumber());
        return new AuthDto.AuthResponse(token, user.getName(), user.getPhoneNumber(), user.getMonthlyBudget());
    }

    private void createDefaultCategories(User user) {
        List<Object[]> defaults = List.of(
            new Object[]{"Food & Dining", "🍽️", "#FF6B6B", BigDecimal.valueOf(5000)},
            new Object[]{"Transportation", "🚗", "#4ECDC4", BigDecimal.valueOf(2000)},
            new Object[]{"Shopping", "🛍️", "#45B7D1", BigDecimal.valueOf(3000)},
            new Object[]{"Entertainment", "🎬", "#96CEB4", BigDecimal.valueOf(1500)},
            new Object[]{"Healthcare", "🏥", "#FFEAA7", BigDecimal.valueOf(2000)},
            new Object[]{"Utilities", "💡", "#DDA0DD", BigDecimal.valueOf(1500)},
            new Object[]{"Rent/EMI", "🏠", "#98D8C8", BigDecimal.valueOf(10000)},
            new Object[]{"Others", "📦", "#B0B0B0", BigDecimal.valueOf(2000)}
        );

        for (Object[] d : defaults) {
            Category cat = new Category();
            cat.setName((String) d[0]);
            cat.setIcon((String) d[1]);
            cat.setColor((String) d[2]);
            cat.setEstimatedCost((BigDecimal) d[3]);
            cat.setAlertThreshold(BigDecimal.valueOf(80));
            cat.setUser(user);
            categoryRepository.save(cat);
        }
    }
}
