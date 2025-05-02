package com.timewave.timewave.controller;

import com.timewave.timewave.dataTransfer.MemoryDTO;
import com.timewave.timewave.model.*;
import com.timewave.timewave.repository.MemoryRepository;
import com.timewave.timewave.repository.UserRepository;
import com.timewave.timewave.service.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

import org.springframework.security.core.context.SecurityContextHolder;

import java.util.stream.Collectors;

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
                                          @RequestParam(required = false) String content,
                                          @RequestParam String location,
                                          @RequestParam(required = false) MultipartFile photo,
                                          @RequestParam(required = false) MultipartFile audio,
                                          @RequestParam(required = false) Double latitude,
                                          @RequestParam(required = false) Double longitude,
                                          @RequestParam (required = false) String date
    ){
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));

            Memory memory = new Memory();
            memory.setTitle(title);
            memory.setDescription(content); // or store as description
            memory.setLocation(location);
            memory.setUser(user);
            memory.setLatitude(latitude);
            memory.setLongitude(longitude);
            memory.setDate(date);

            // Create attachment list
            List<Attachment> attachments = new ArrayList<>();

            if (photo != null && !photo.isEmpty()) {
                String path = fileService.savePhoto(photo);
                PhotoAttachment photoAttachment = new PhotoAttachment();
                photoAttachment.setFilePath(path);
                photoAttachment.setMimeType(photo.getContentType());
                photoAttachment.setMemory(memory);
                attachments.add(photoAttachment);
            }

            if (audio != null && !audio.isEmpty()) {
                String path = fileService.saveAudio(audio);
                AudioAttachment audioAttachment = new AudioAttachment();
                audioAttachment.setFilePath(path);
                audioAttachment.setMimeType(audio.getContentType());
                audioAttachment.setMemory(memory);
                attachments.add(audioAttachment);
            }

            memory.setAttachments(attachments);
            Memory saved = memoryRepository.save(memory);
            MemoryDTO memoryDTO = new MemoryDTO(saved);
            return ResponseEntity.ok(memoryDTO);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create memory", "details", e.getMessage()));
        }
    }
    @PutMapping("/{id}")
    public ResponseEntity<?> updateMemory(@PathVariable Long id,
                                          @RequestParam(required = false) String title,
                                          @RequestParam(required = false) String description,
                                          @RequestParam(required = false) String location,
                                          @RequestParam(required = false) String date,
                                          @RequestParam(required = false) String mood) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return memoryRepository.findById(id).map(memory -> {
            if (!memory.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not your memory");
            }

            if (title != null) memory.setTitle(title);
            if (description != null) memory.setDescription(description);
            if (location != null) memory.setLocation(location);
            if (date != null) memory.setDate(date);
            if (mood != null) memory.setMood(mood);

            memoryRepository.save(memory);
            return ResponseEntity.ok(new MemoryDTO(memory));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMemory(@PathVariable Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return memoryRepository.findById(id).map(memory -> {
            if (!memory.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not your memory");
            }

            memoryRepository.delete(memory);
            return ResponseEntity.ok().body("Memory deleted");
        }).orElse(ResponseEntity.notFound().build());
    }






    // Get all memories (optional, for testing purposes)
    @GetMapping
    public List<MemoryDTO> getAllMemories() {
        return memoryRepository.findAll().stream()
                .map(MemoryDTO::new)
                .collect(Collectors.toList());
    }

    @GetMapping("/calendar-data")
    public Map<String, Object> getCalendarData() {
        return memoryRepository.findAll().stream()
                .filter(m -> m.getDate() != null)
                .collect(Collectors.toMap(
                        Memory::getDate,
                        memory -> Map.of("mood", memory.getMood() != null ? memory.getMood() : "neutral"),
                        (existing, replacement) -> existing
                ));
    }

}
