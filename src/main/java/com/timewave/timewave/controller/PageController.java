package com.timewave.timewave.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import org.springframework.ui.Model;
import java.util.Arrays;
import java.util.List;

import com.timewave.timewave.model.Memory;

@Controller
public class PageController {
    // Render the login page
    @GetMapping("/login")
    public String loginPage() {
        return "login";  // This will resolve to src/main/resources/templates/login.html
    }

    // Handle the login form submission
    @PostMapping("/login")
    public String loginSubmit(@RequestParam String email, @RequestParam String password) {
        // Authenticate the user (example check)
        if ("admin@example.com".equals(email) && "password123".equals(password)) {
            return "redirect:/home";  // Redirect to home if successful
        }
        return "redirect:/login?error";  // Redirect back to login page with error
    }

    @GetMapping({"/", "/home"})
    public String homePage(Model model) {
        // Dummy memories
//        List<Memory> memories = Arrays.asList(
//                new Memory("Trip to Paris", "Saw the Eiffel Tower", "2023-04-20", "Paris", "relax", "content", "image"),
//                new Memory("Beach day", "Relaxed by the sea", "2024-07-15", "Barcelona", "anxious", "content", "image")
//        );
//
//        // Dummy "On This Day"
//        String onThisDay = "Today, 2 years ago, you graduated! 🎓";
//
//        // Attach to model
//        model.addAttribute("memories", memories);
//        model.addAttribute("onThisDay", onThisDay);

        return "index";  // Still render index.html
    }


}
