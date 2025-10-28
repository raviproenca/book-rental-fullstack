package org.example.app.models.requests;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.Length;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = false)
public class PublisherRequestDTO {
    @NotBlank(message = "O nome é obrigatório")
    @Length(min = 3, message = "O nome deve ter pelo menos 3 caracteres")
    @Pattern(
            regexp = "^[A-Za-zÀ-ÖØ-öø-ÿ\\s]+$",
            message = "O nome não deve conter números nem caracteres especiais"
    )
    private String name;

    @NotBlank(message = "O email é obrigatório")
    @Email(message = "Insira um email válido")
    private String email;

    @NotBlank(message = "O telefone é obrigatório")
    @Pattern(
            regexp = "\\(?([1-9]{2})\\)?\\s?([9]?)([0-9]{4})-?([0-9]{4})",
            message = "Insira um telefone válido (ex: (11) 91234-5678)"
    )
    private String telephone;

    @NotBlank(message = "O site é obrigatório")
    @Pattern(
            regexp = "^(https?://)?(www\\.)?[a-zA-Z0-9-]+\\.[a-zA-Z]{2,}(\\.[a-zA-Z]{2,})?$",
            message = "O site deve seguir o formato correto (ex: https://www.exemplo.com)"
    )
    private String site;
}
