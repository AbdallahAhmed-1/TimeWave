package com.timewave.timewave.controller;

import com.timewave.timewave.model.Memory;
import com.timewave.timewave.model.User;
import com.timewave.timewave.repository.MemoryRepository;
import com.timewave.timewave.repository.UserRepository;
import com.timewave.timewave.service.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import org.springframework.security.core.context.SecurityContextHolder;
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

    // Create a memory
    @PostMapping
    public Memory createMemory(@RequestParam String title,
                               @RequestParam String location,
                               @RequestParam String type,
                               @RequestParam(required = false) String content,
                               @RequestParam(required = false) MultipartFile photo) {

        // Get the current authenticated user
        String email = SecurityContextHolder.getContext().getAuthentication().getName(); // Get email from security context
        System.out.println("Authenticated email from SecurityContext: " + email);
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();

            // Create a new memory instance
            Memory memory = new Memory();
            memory.setTitle(title);
            memory.setLocation(location);
            memory.setType(type);
            memory.setUser(user);  // Associate the memory with the user

            // If type is text, store content
            if ("text".equals(type)) {
                memory.setContent(content);
            }
            // If type is photo and a photo was uploaded, save it
            else if ("photo".equals(type) && photo != null) {
                String photoPath = fileService.savePhoto(photo); // Save photo and get its path
                memory.setContent(photoPath);  // Store the path to the photo
            }

            return memoryRepository.save(memory); // Save the memory in the database
        } else {
            throw new RuntimeException("User not found");
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
