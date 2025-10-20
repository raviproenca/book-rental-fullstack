package org.example.app.models.requests;

import lombok.Data;

import java.time.LocalDate;

@Data
public class RentUpdateDTO {
    private Long renterId;
    private Long bookId;
    private LocalDate deadLine;
    private LocalDate devolutionDate;
}
