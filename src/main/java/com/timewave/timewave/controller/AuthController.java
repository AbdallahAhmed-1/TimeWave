package com.timewave.timewave.controller;

import com.timewave.timewave.model.User;
import com.timewave.timewave.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    // Create a password encoder
    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // LOGIN
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestParam String email, @RequestParam String password) {
        return userRepository.findByEmail(email)
                .map(user -> {
                    if (passwordEncoder.matches(password, user.getPassword())) {
                        return ResponseEntity.ok("Login success!");
                    } else {
                        return ResponseEntity.status(401).body("Wrong password");
                    }
                })
                .orElse(ResponseEntity.status(404).body("User not found"));
    }

    // REGISTER
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestParam String username,
                                           @RequestParam String email,
                                           @RequestParam String password) {
        // Check if user already exists
        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.status(400).body("Email already in use");
        }

        // Create a new user with encrypted password
        User newUser = new User(username, email, passwordEncoder.encode(password));
        userRepository.save(newUser);
        return ResponseEntity.ok("User registered successfully!");
    }
}
