package org.example.app.models.requests;

import lombok.Data;

@Data
public class AuthRequestDTO {
    private String email;
    private String password;
}
