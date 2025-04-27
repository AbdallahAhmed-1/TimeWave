package com.timewave.timewave.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class PageController {
    // Render the home page
    @GetMapping({"/", "/home"})
    public String homePage() {
        return "index";  // This will resolve to src/main/resources/templates/index.html
    }

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
}
