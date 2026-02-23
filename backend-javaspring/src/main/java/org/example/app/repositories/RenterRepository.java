package org.example.app.repositories;

import org.example.app.models.entities.RenterEntity;
import org.example.app.models.entities.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface RenterRepository extends JpaRepository<RenterEntity, Long>, JpaSpecificationExecutor<RenterEntity> {
    Optional<RenterEntity> findByEmail(String email);
    Optional<RenterEntity> findByCpf(String cpf);
}
