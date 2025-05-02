package com.timewave.timewave.dataTransfer;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.timewave.timewave.model.Attachment;
import com.timewave.timewave.model.Memory;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MemoryDTO {
    private Integer id;
    private String title;
    private String description;
    private String date;
    private String location;
    private Double latitude;
    private Double longitude;
    private String mood;
    private String type;
    private List<AttachmentDTO> attachments;

    public MemoryDTO(Memory memory) {
        this.id = memory.getId();
        this.title = memory.getTitle();
        this.description = memory.getDescription();
        this.date = memory.getDate();
        this.location = memory.getLocation();
        this.latitude = memory.getLatitude();
        this.longitude = memory.getLongitude();
        this.mood = memory.getMood();
        this.attachments = memory.getAttachments().stream()
                .map(AttachmentDTO::new)
                .collect(Collectors.toList());
    }
}