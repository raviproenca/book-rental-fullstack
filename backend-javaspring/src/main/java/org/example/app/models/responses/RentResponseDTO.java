package org.example.app.models.responses;

import org.example.app.models.entities.BookEntity;
import org.example.app.models.entities.RenterEntity;

import java.time.LocalDate;

public record RentResponseDTO(Long id, RenterEntity renter, BookEntity book, LocalDate deadLine, LocalDate devolutionDate, LocalDate rentDate, String status ) {

}
