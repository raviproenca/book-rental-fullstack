package org.example.app.models.requests;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RenterRequestDTO {
    private String name;
    private String email;
    private String telephone;
    private String address;
    private String cpf;
}
