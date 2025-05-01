package com.timewave.timewave.dataTransfer;

import com.timewave.timewave.model.Attachment;

@lombok.Getter
@lombok.Setter
public class AttachmentDTO {
    private String filePath;
    private String mimeType;

    public AttachmentDTO(Attachment attachment) {
        this.filePath = "/uploads/" + attachment.getFilePath();
        this.mimeType = attachment.getMimeType(); // e.g., "image/png", "audio/webm"
    }
}