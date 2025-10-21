package org.example.app.models.requests;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RentRequestDTO {
    private Long renterId;
    private Long bookId;
    private LocalDate deadLine;
}
