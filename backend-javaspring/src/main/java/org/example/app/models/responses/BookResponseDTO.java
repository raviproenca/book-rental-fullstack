package org.example.app.models.responses;

import lombok.Data;

import java.util.Date;

@Data
public class BookResponseDTO {
    private Long id;
    private String name;
    private String author;
    private Date launchDate;
    private Integer totalQuantity;
    private Integer totalInUse;
    private Long publisherId;
}
