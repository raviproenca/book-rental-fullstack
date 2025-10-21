package org.example.app.models.responses;

import java.time.LocalDate;

public record BookResponseDTO(Long id, String name, String author, LocalDate launchDate, Integer totalQuantity, Integer totalInUse, Long publisherId) { }
