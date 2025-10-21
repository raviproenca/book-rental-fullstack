package org.example.app.models.requests;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookRequestDTO {
    private String name;
    private String author;
    private Long publisherId;
    private LocalDate launchDate;
    private Integer totalQuantity;
}
