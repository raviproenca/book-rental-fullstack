package org.example.app.models.requests;

import lombok.Data;

import java.time.LocalDate;

@Data
public class BookRequestDTO {
    private String name;
    private String author;
    private Long publisherId;
    private LocalDate launchDate;
    private Integer totalQuantity;
}
