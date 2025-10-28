package org.example.app.models.requests;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.Length;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = false)
public class UserRequestDTO {
    @NotBlank(message = "O nome é obrigatório")
    @Length(min = 3, message = "O nome deve ter pelo menos 3 caracteres")
    @Pattern(regexp = "^[A-Za-zÀ-ÖØ-öø-ÿ\\s]+$", message = "O nome não deve conter números nem caracteres inválidos")
    private String name;

    @NotBlank(message = "O email é obrigatório")
    @Email(message = "Insira um email válido")
    private String email;

    @NotBlank(message = "A senha é obrigatória")
    @Size(min = 8, message = "A senha deve ter no mínimo 8 caracteres")
    private String password;

    @NotBlank(message = "A permissão do usuário é obrigatória")
    private String role;
}
