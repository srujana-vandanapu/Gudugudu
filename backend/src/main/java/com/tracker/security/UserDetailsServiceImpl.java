package com.tracker.security;

import com.tracker.model.User;
import com.tracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String phoneNumber) throws UsernameNotFoundException {
        User user = userRepository.findByPhoneNumber(phoneNumber)
            .orElseThrow(() -> new UsernameNotFoundException("User not found with phone: " + phoneNumber));
        return new org.springframework.security.core.userdetails.User(
            user.getPhoneNumber(),
            user.getPassword(),
            new ArrayList<>()
        );
    }
}
