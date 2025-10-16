package org.example.app.models.requests;

import lombok.Data;

import java.time.LocalDate;

@Data
public class RentRequestDTO {
    private Long renterId;
    private Long bookId;
    private LocalDate deadLine;
}
