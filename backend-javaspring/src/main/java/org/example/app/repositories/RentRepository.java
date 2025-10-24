package org.example.app.repositories;

import org.example.app.models.entities.BookEntity;
import org.example.app.models.entities.RentEntity;
import org.example.app.models.responses.RenterRentCountDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RentRepository extends JpaRepository<RentEntity, Long> {
    @Query("SELECT COUNT(r) FROM RentEntity r WHERE r.bookEntity.id = :bookId AND r.status IN ('RENTED', 'LATE')")
    int countActiveRentsByBookId(@Param("bookId") Long bookId);

    @Query("SELECT r.bookEntity FROM RentEntity r GROUP BY r.bookEntity ORDER BY COUNT(r.bookEntity) DESC")
    Page<BookEntity> findMostRentedBooks(Pageable pageable);

    @Query("SELECT COUNT(r) FROM RentEntity r WHERE r.status = 'IN_TIME'")
    Long findDeliveredInTimeBooks();

    @Query("SELECT COUNT(r) FROM RentEntity r WHERE r.status = 'DELIVERED_WITH_DELAY'")
    Long findDeliveredWithDelayBooks();

    @Query("SELECT COUNT(r) FROM RentEntity r WHERE r.status = 'LATE'")
    Long findLateBooks();

    @Query("SELECT new org.example.app.models.responses.RenterRentCountDTO(r.renterEntity.name, COUNT(r)) " +
            "FROM RentEntity r " +
            "GROUP BY r.renterEntity.name " +
            "ORDER BY COUNT(r) DESC")
    List<RenterRentCountDTO> countRentsPerRenter();

    @Query("SELECT COUNT(r) FROM RentEntity r")
    Long findAllRentsQuantity();

    boolean existsByRenterEntity_Id(Long renterId);
    boolean existsByBookEntity_Id(Long bookId);

}
