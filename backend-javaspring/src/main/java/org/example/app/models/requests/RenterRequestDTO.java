package org.example.app.models.requests;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = false)
public class RenterRequestDTO {
    @NotBlank(message = "O nome é obrigatório.")
    @Size(min = 3, message = "O nome não deve ter menos de 3 letras.")
    @Pattern(regexp = "^[^\\d]+$", message = "O nome não deve conter números.")
    private String name;

    @NotBlank(message = "O email é obrigatório.")
    @Email(message = "Insira um email válido.")
    private String email;

    @NotBlank(message = "O telefone é obrigatório.")
    @Pattern(
            regexp = "\\(?([1-9]{2})\\)?\\s?([9]?)([0-9]{4})-?([0-9]{4})",
            message = "Insira um telefone válido (ex: (11) 91234-5678)."
    )
    private String telephone;

    @NotBlank(message = "O endereço é obrigatório.")
    @Size(min = 3, message = "O endereço não deve ter menos de 3 letras.")
    private String address;

    @NotBlank(message = "O CPF é obrigatório.")
    @Pattern(
            regexp = "\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}",
            message = "O CPF deve estar no formato XXX.XXX.XXX-XX."
    )
    private String cpf;
}
