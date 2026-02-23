package org.example.app.models.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Data
@Table(name = "books")
public class BookEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    @Column(nullable = false)
    private String author;

    @Column(nullable = false, name = "launch_date")
    private LocalDate launchDate;

    @Column(nullable = false, name = "total_quantity")
    private Integer totalQuantity;

    @Column(nullable = false, name = "total_in_use")
    private Integer totalInUse;

    @ManyToOne
    @JoinColumn(name = "publisher_id")
    private PublisherEntity publisher;
}
