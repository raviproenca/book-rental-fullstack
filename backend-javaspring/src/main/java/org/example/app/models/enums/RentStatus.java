package org.example.app.models.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum RentStatus {
    RENTED("Alugado"),
    LATE("Atrasado"),
    IN_TIME("Devolvido no prazo"),
    DELIVERED_WITH_DELAY("Devolvido com atraso");

    private final String description;
}
