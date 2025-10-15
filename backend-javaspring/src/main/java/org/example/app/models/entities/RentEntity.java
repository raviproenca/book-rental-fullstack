package org.example.app.models.entities;

import jakarta.persistence.*;
import lombok.Data;
import org.example.app.models.enums.RentStatus;

import java.util.Date;

@Entity
@Data
@Table(name = "rents")
public class RentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "renter_id")
    private RenterEntity renterEntity;

    @ManyToOne
    @JoinColumn(name = "book_id")
    private BookEntity bookEntity;

    @Column(nullable = false, name = "dead_line")
    private Date deadLine;

    @Column(nullable = false, name = "devolution_date")
    private Date devolutionDate;

    @Column(nullable = false, name = "rent_date")
    private Date rentDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, columnDefinition = "rent_status")
    private RentStatus status;
}
