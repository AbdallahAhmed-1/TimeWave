package com.timewave.timewave.controller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/newsletter")
public class SubscriptionController {

    @Autowired
    private JavaMailSender mailSender;

    @PostMapping("/subscribe")
    public ResponseEntity<String> subscribe(@RequestParam("email") String email) {
        // Construct the email
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Thank you for subscribing!");
        message.setText("You have successfully subscribed to our newsletter.");

        // Send it
        mailSender.send(message);

        return ResponseEntity.ok("Subscription successful");
    }
}

