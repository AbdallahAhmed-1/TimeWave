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
        return saveFile(photo);
    }

    public String saveAudio(MultipartFile audio) {
        return saveFile(audio);
    }

    private String saveFile(MultipartFile file) {
        try {
            String fileName = UUID.randomUUID() + "-" + file.getOriginalFilename();
            Path path = Paths.get(UPLOAD_DIR, fileName);

            Files.createDirectories(path.getParent());
            Files.write(path, file.getBytes());

            return fileName;
        } catch (IOException e) {
            throw new RuntimeException("Error saving file: " + e.getMessage(), e);
        }
    }
}