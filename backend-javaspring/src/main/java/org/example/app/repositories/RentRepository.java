package org.example.app.repositories;

import org.example.app.models.entities.RentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RentRepository extends JpaRepository<RentEntity, Long> {
}
