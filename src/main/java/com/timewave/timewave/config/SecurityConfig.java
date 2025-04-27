package com.timewave.timewave.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Turn off CSRF since we're a pure REST backend
                .csrf(csrf -> csrf.disable())

                // Make /auth/** public, and require nothing on all others (or customize as you go)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/**").permitAll()
                        .anyRequest().permitAll()      // <-- for now, allow everything
                )

                // Disable both the default login form and HTTP Basic
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())
        ;

        return http.build();
    }
}
