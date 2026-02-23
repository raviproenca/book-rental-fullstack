package org.example.app.models.requests;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = false)
public class RentRequestDTO {
    @NotNull(message = "O ID do locatário é obrigatório.")
    private Long renterId;

    @NotNull(message = "O ID do livro é obrigatório.")
    private Long bookId;

    @NotNull(message = "O prazo de devolução é obrigatório.")
    @FutureOrPresent(message = "O prazo de devolução não pode estar no passado.")
    private LocalDate deadLine;
}
