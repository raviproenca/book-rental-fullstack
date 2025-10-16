package org.example.app.models.responses;

import lombok.Data;

import java.time.LocalDate;

@Data
public class RentResponseDTO {
    private Long id;
    private Long renterId;
    private Long bookId;
    private LocalDate deadLine;
    private LocalDate devolutionDate;
    private LocalDate rentDate;
    private String status;
}
