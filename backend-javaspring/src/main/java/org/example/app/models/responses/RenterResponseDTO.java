package org.example.app.models.responses;

import lombok.Data;

@Data
public class RenterResponseDTO {
    private Long id;
    private String name;
    private String email;
    private String telephone;
    private String address;
    private String cpf;
}
