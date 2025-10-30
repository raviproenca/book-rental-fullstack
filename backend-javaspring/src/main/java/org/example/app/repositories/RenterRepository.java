package org.example.app.repositories;

import org.example.app.models.entities.RenterEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RenterRepository extends JpaRepository<RenterEntity, Long> {
    Optional<RenterEntity> findByEmail(String email);
    Optional<RenterEntity> findByCpf(String cpf);
}
