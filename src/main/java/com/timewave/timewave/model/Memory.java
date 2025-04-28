package com.timewave.timewave.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

@Entity
public class Memory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

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




    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getMood() {
        return mood;
    }

    public void setMood(String mood) {
        this.mood = mood;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
