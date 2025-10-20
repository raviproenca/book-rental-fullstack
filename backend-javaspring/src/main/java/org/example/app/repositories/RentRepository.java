package org.example.app.repositories;

import org.example.app.models.entities.RentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface RentRepository extends JpaRepository<RentEntity, Long> {
    @Query("SELECT COUNT(r) FROM RentEntity r WHERE r.bookEntity.id = :bookId AND r.status IN ('RENTED', 'LATE')")
    int countActiveRentsByBookId(@Param("bookId") Long bookId);
}
