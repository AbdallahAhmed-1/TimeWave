package com.timewave.timewave.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.Data;

@Data
@Entity
public class Memory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String title;
    private String description;
    private String date;
    private String location;
    private String mood;

    // Add the user relationship here
    @ManyToOne
    private User user; // Many memories can belong to one user

    // Constructors
    public Memory() {}

    public Memory(String title, String description, String date, String location, String mood, User user) {
        this.title = title;
        this.description = description;
        this.date = date;
        this.location = location;
        this.mood = mood;
        this.user = user;
    }

    // Constructor without User
    public Memory(String title, String description, String date, String location, String mood) {
        this.title = title;
        this.description = description;
        this.date = date;
        this.location = location;
        this.mood = mood;
    }


}
