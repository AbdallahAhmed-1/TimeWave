package com.timewave.timewave.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileService {

    private static final String UPLOAD_DIR = "uploads/";

    public String savePhoto(MultipartFile photo) {
        try {
            // Generate a unique filename to avoid collisions
            String fileName = UUID.randomUUID().toString() + "-" + photo.getOriginalFilename();
            Path path = Paths.get(UPLOAD_DIR, fileName);

            // Create the directory if it doesn't exist
            Files.createDirectories(path.getParent());

            // Save the photo to the filesystem
            Files.write(path, photo.getBytes());

            return fileName;  // Return the file path or URL (if you're saving it to cloud storage)
        } catch (IOException e) {
            e.printStackTrace();
            throw new RuntimeException("Error saving photo: " + e.getMessage());
        }
    }
}
