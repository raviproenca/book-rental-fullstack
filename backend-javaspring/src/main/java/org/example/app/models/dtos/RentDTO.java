package org.example.app.models.dtos;

import lombok.Data;

import java.util.Date;

@Data
public class RentDTO {
    private Integer renterId;
    private Integer bookId;
    private Date deadLine;
    private Date devolutionDate;
    private Date rentDate;
    private String status;
}
