package org.example.app.models.responses;

import lombok.Data;

@Data
public class AuthResponseDTO {
    private String name;
    private String email;
    private String role;
    private String token;
}
