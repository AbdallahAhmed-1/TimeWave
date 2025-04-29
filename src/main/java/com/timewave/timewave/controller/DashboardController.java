package com.timewave.timewave.controller;

import com.timewave.timewave.model.User;
import com.timewave.timewave.model.Memory;
import com.timewave.timewave.repository.UserRepository;
import com.timewave.timewave.repository.MemoryRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.security.Principal;
import java.util.List;

@Controller
public class DashboardController {

    private final UserRepository userRepository;
    private final MemoryRepository memoryRepository;

    public DashboardController(UserRepository userRepository,
                               MemoryRepository memoryRepository, UserDetailsService userDetailsService) {
        this.userRepository = userRepository;
        this.memoryRepository = memoryRepository;
    }

    @GetMapping("/dashboard")
    public String dashboard(Authentication authentication, Model model) {
//        // Fetch the logged-in user
//        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
//        String email = userDetails.getUsername();
//        User user = userRepository.findByEmail(email) .orElseThrow(() -> new UsernameNotFoundException("User not found"));
////
////        // Fetch that user's memories
//        List<Memory> memories = memoryRepository.findByUserId(user.getId());
////
//        // Example "On This Day" text – replace with your own logic/service call
//        String onThisDay = "Nothing special today…";
//
//        // Add attributes to the model for Thymeleaf
//        model.addAttribute("user", user);
//        model.addAttribute("onThisDay", onThisDay);

        // Render src/main/resources/templates/dashboard.html
        return "dashboard";
    }
}
