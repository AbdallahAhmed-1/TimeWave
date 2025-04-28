package com.timewave.timewave.controller;

import com.timewave.timewave.model.Memory;

import com.timewave.timewave.repository.MemoryRepository;
import com.timewave.timewave.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.web.bind.annotation.*;



@RestController
@RequestMapping("/api/memories")
@CrossOrigin
public class MemoryController {

    @Autowired
    private MemoryRepository memoryRepository;

    @Autowired
    private UserRepository userRepository;

    // Create a memory
    @PostMapping
    public Memory createMemory(@RequestBody Memory memory) {
        // Get the current authenticated user
        //Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        //String email = authentication.getName(); // Assuming email is stored as the username

        // Find the user by email
       // Optional<User> userOpt = userRepository.findByEmail(email);

        //if (userOpt.isPresent()) {
       //     User user = userOpt.get();
       //     memory.setUser(user); // Associate memory with the authenticated user
            return memoryRepository.save(memory);
       // } else {
      //      throw new RuntimeException("User not found");
        }
    }

    // Get all memories
    //@GetMapping
   // public List<Memory> getAllMemories() {
   //     return memoryRepository.findAll();
    //}
//}
