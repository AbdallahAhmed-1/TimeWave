package com.timewave.timewave.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;

@Entity
@DiscriminatorValue("photo")
@Data
public class PhotoAttachment extends Attachment {
    private Integer width;
    private Integer height;
}
