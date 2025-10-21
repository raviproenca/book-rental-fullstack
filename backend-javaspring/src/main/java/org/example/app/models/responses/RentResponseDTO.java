package org.example.app.models.responses;

import java.time.LocalDate;

public record RentResponseDTO(Long id, Long renterId, Long bookId, LocalDate deadLine, LocalDate devolutionDate, LocalDate rentDate, String status ) {

}
