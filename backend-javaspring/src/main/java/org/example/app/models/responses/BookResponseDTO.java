package org.example.app.models.responses;

import org.example.app.models.entities.PublisherEntity;

import java.time.LocalDate;

public record BookResponseDTO(Long id, String name, String author, LocalDate launchDate, Integer totalQuantity, Integer totalInUse, PublisherEntity publisher) {     }
