package org.example.app.models.entities;

import jakarta.persistence.*;
import lombok.Data;
import org.example.app.models.enums.RentStatus;

import java.time.LocalDate;

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
    private LocalDate deadLine;

    @Column(name = "devolution_date")
    private LocalDate devolutionDate;

    @Column(nullable = false, name = "rent_date")
    private LocalDate rentDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, columnDefinition = "rent_status")
    private RentStatus status;
}
