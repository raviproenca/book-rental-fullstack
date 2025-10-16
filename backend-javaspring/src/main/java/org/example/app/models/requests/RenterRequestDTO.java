package org.example.app.models.requests;

import lombok.Data;

@Data
public class RenterRequestDTO {
    private String name;
    private String email;
    private String telephone;
    private String address;
    private String cpf;
}
