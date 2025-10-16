package org.example.app.models.responses;

import lombok.Data;

@Data
public class PublisherResponseDTO {
    private Long id;
    private String name;
    private String email;
    private String telephone;
    private String site;
}
