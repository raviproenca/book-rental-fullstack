package org.example.app.models.responses;

import lombok.*;

public record AuthResponseDTO(String name, String role, String email, String token) {

}
