package org.example.app.models.responses;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RenterResponseDTO {
    private Long id;
    private String name;
    private String email;
    private String telephone;
    private String address;
    private String cpf;
}
