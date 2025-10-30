package org.example.app.repositories;

import org.example.app.models.entities.PublisherEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PublisherRepository extends JpaRepository<PublisherEntity, Long> {
    Optional<PublisherEntity> findByEmail(String email);
    Optional<PublisherEntity> findByName(String name);
}
