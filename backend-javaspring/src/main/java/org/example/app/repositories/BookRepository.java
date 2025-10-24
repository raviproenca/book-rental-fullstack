package org.example.app.repositories;

import org.example.app.models.entities.BookEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface BookRepository extends JpaRepository<BookEntity, Long> {
    Optional<BookEntity> findByName(String name);

    boolean existsByPublisher_Id(Long publisherId);
}
