package com.timewave.timewave.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;

@Entity
@DiscriminatorValue("audio")
@Data
public class AudioAttachment extends Attachment {

    private Integer durationSeconds; // Optional metadata

}