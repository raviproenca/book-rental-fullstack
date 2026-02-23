package org.example.app.repositories;

import org.example.app.models.entities.PublisherEntity;
import org.example.app.models.entities.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface PublisherRepository extends JpaRepository<PublisherEntity, Long>, JpaSpecificationExecutor<PublisherEntity> {
    Optional<PublisherEntity> findByEmail(String email);
    Optional<PublisherEntity> findByName(String name);
}
