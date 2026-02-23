package org.example.app.models.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "renters")
public class RenterEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String telephone;

    @Column(nullable = false)
    private String address;

    @Column(unique = true, nullable = false)
    private String cpf;

}
