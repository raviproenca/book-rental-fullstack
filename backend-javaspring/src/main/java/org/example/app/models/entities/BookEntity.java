package org.example.app.models.entities;

import jakarta.persistence.*;

import java.util.Date;

public class BookEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String author;

    @Column(nullable = false, name = "launch_date")
    private Date launchDate;

    @Column(nullable = false, name = "total_quantity")
    private Integer totalQuantity;

    @ManyToOne
    @JoinColumn(name = "publisher_id")
    private PublisherEntity publisher;
}
