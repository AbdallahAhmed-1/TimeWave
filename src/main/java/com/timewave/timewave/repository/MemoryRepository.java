package com.timewave.timewave.repository;

import com.timewave.timewave.model.Memory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MemoryRepository extends JpaRepository<Memory, Long> {
    // Method to find memories by user
    List<Memory> findByUserId(Integer userId);
}
