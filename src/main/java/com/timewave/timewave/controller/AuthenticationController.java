package com.timewave.timewave.controller;

import com.timewave.timewave.auth.AuthenticationRequest;
import com.timewave.timewave.auth.AuthenticationResponse;
import com.timewave.timewave.auth.AuthenticationService;
import com.timewave.timewave.auth.RegisterRequest;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

// endpoints to expose
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService service;

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(
            @RequestBody RegisterRequest request,
            HttpServletResponse response

    ){
        AuthenticationResponse authResponse = service.register(request);

        ResponseCookie cookie = ResponseCookie.from("jwt", authResponse.getToken())
                .httpOnly(true)
                .secure(false) // change to true in production (HTTPS)
                .path("/")
                .maxAge(24 * 60 * 60)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return ResponseEntity.ok(authResponse);

    }
    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(
            @RequestBody AuthenticationRequest request,
            HttpServletResponse response
    ){
        AuthenticationResponse authResponse = service.authenticate(request);

        ResponseCookie cookie = ResponseCookie.from("jwt", authResponse.getToken())
                .httpOnly(true)
                .secure(false) // change to true in production
                .path("/")
                .maxAge(24 * 60 * 60)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return ResponseEntity.ok(authResponse);

    }
}
