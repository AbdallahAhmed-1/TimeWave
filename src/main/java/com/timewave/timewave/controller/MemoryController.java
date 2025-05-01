package com.timewave.timewave.controller;

import com.timewave.timewave.model.Memory;
import com.timewave.timewave.model.User;
import com.timewave.timewave.repository.MemoryRepository;
import com.timewave.timewave.repository.UserRepository;
import com.timewave.timewave.service.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Map;
import java.util.Optional;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/memories")
@CrossOrigin
public class MemoryController {

    @Autowired
    private MemoryRepository memoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FileService fileService;
    @PostMapping
    public ResponseEntity<?> createMemory(@RequestParam String title,
                                          @RequestParam String location,
                                          @RequestParam String type,
                                          @RequestParam(required = false) String content,
                                          @RequestParam(required = false) MultipartFile photo) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            Optional<User> userOpt = userRepository.findByEmail(email);

            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not found"));
            }

            User user = userOpt.get();
            Memory memory = new Memory();
            memory.setTitle(title);
            memory.setLocation(location);
            memory.setType(type);
            memory.setUser(user);

            if ("text".equals(type)) {
                memory.setContent(content);
            } else if ("photo".equals(type) && photo != null) {
                String photoPath = fileService.savePhoto(photo); // This could throw
                memory.setContent(photoPath);
            }

            Memory saved = memoryRepository.save(memory);
            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            e.printStackTrace(); // Log to server
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Something went wrong", "details", e.getMessage()));
        }
    }

//    @DeleteMapping("/{id}")
//    public ResponseEntity<?> deleteMemory(@PathVariable Long id, Authentication authentication) {
//        Optional<Memory> memoryOpt = memoryRepository.findById(id);
//
//        if (memoryOpt.isEmpty()) {
//            return ResponseEntity.notFound().build();
//        }
//
//        Memory memory = memoryOpt.get();
//        String email = authentication.getName();
//
//        if (!memory.getUser().getEmail().equals(email)) {
//            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You cannot delete someone else's memory");
//        }
//
//        memoryRepository.delete(memory);
//        return ResponseEntity.ok().body("Memory deleted");
//    }
//


    // Get all memories (optional, for testing purposes)
    @GetMapping
    public List<Memory> getAllMemories() {
        return memoryRepository.findAll();
    }
}
