package org.example.app.models.requests;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.Length;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = false)
public class BookRequestDTO {
    @NotBlank(message = "O nome do livro é obrigatório")
    @Length(min = 3, message = "O nome do livro deve ter pelo menos 3 caracteres")
    @Pattern(
            regexp = "^[A-Za-zÀ-ÖØ-öø-ÿ\\s]+$",
            message = "O nome do livro não deve conter números nem caracteres especiais"
    )
    private String name;

    @NotBlank(message = "O nome do autor é obrigatório")
    @Length(min = 3, message = "O nome do autor deve ter pelo menos 3 caracteres")
    @Pattern(
            regexp = "^[A-Za-zÀ-ÖØ-öø-ÿ\\s]+$",
            message = "O nome do autor não deve conter números nem caracteres especiais"
    )
    private String author;

    @NotNull(message = "O ID da editora é obrigatório")
    @Positive(message = "O ID da editora deve ser um número positivo")
    private Long publisherId;

    @NotNull(message = "A data de lançamento é obrigatória")
    @PastOrPresent(message = "A data de lançamento não pode ser no futuro")
    private LocalDate launchDate;

    @NotNull(message = "A quantidade total de livros é obrigatória")
    @Positive(message = "A quantidade total deve ser um número positivo")
    private Integer totalQuantity;
}
