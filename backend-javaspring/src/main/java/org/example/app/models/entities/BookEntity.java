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
    private String email;

    @Column(nullable = false, name = "launch_date")
    private Date launchDate;

    @ManyToOne
    @JoinColumn(name = "publisher_id")
    private PublisherEntity publisher;
}
