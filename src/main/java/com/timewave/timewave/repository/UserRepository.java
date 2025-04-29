package com.timewave.timewave.repository;

import com.timewave.timewave.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    // To find a user by email (for login)
    Optional<User> findByEmail(String email);

}
