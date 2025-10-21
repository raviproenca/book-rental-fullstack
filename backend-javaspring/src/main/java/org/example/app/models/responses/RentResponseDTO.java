package org.example.app.models.responses;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RentResponseDTO {
    private Long id;
    private Long renterId;
    private Long bookId;
    private LocalDate deadLine;
    private LocalDate devolutionDate;
    private LocalDate rentDate;
    private String status;
}
