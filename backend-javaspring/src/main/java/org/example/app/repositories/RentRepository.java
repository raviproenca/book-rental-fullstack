package org.example.app.repositories;

import org.example.app.models.entities.BookEntity;
import org.example.app.models.entities.RentEntity;
import org.example.app.models.responses.MonthlyCountDTO;
import org.example.app.models.responses.RenterRentCountDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface RentRepository extends JpaRepository<RentEntity, Long> {

    public static final String DATE_FORMAT_POSTGRES = "TO_CHAR(r.rentDate, 'YYYY-MM')";

    @Query("SELECT COUNT(r) FROM RentEntity r WHERE r.bookEntity.id = :bookId AND r.status IN ('RENTED', 'LATE')")
    int countActiveRentsByBookId(@Param("bookId") Long bookId);

    @Query("SELECT r.bookEntity FROM RentEntity r " +
            "WHERE r.rentDate >= :startDate " +
            "GROUP BY r.bookEntity ORDER BY COUNT(r.bookEntity) DESC")
    Page<BookEntity> findMostRentedBooks(Pageable pageable, @Param("startDate") LocalDate startDate);

    @Query("SELECT NEW org.example.app.models.responses.MonthlyCountDTO(COUNT(r), " + DATE_FORMAT_POSTGRES + ") " +
            "FROM RentEntity r " +
            "WHERE r.status = 'IN_TIME' AND r.rentDate >= :startDate " +
            "GROUP BY " + DATE_FORMAT_POSTGRES + " " +
            "ORDER BY " + DATE_FORMAT_POSTGRES + " ASC")
    List<MonthlyCountDTO> findDeliveredInTimeBooks(@Param("startDate") LocalDate startDate);

    @Query("SELECT NEW org.example.app.models.responses.MonthlyCountDTO(COUNT(r), " + DATE_FORMAT_POSTGRES + ") " +
            "FROM RentEntity r " +
            "WHERE r.status = 'DELIVERED_WITH_DELAY' AND r.rentDate >= :startDate " +
            "GROUP BY " + DATE_FORMAT_POSTGRES + " " +
            "ORDER BY " + DATE_FORMAT_POSTGRES + " ASC")
    List<MonthlyCountDTO> findDeliveredWithDelayBooks(@Param("startDate") LocalDate startDate);

    @Query("SELECT COUNT(r) FROM RentEntity r " +
            "WHERE r.status = 'LATE' AND r.rentDate >= :startDate")
    Long findLateBooks(@Param("startDate") LocalDate startDate);

    @Query("SELECT new org.example.app.models.responses.RenterRentCountDTO(" +
            "    r.renterEntity.name, " +
            "    COUNT(r), " +
            "    SUM(CASE WHEN r.status IN ('RENTED', 'LATE') THEN 1 ELSE 0 END)" +
            ") " +
            "FROM RentEntity r " +
            "GROUP BY r.renterEntity.name " +
            "ORDER BY COUNT(r) DESC")
    List<RenterRentCountDTO> countRentsPerRenter();

    @Query("SELECT COUNT(r) FROM RentEntity r WHERE r.rentDate >= :startDate")
    Long findAllRentsQuantity(@Param("startDate") LocalDate startDate);

    boolean existsByRenterEntity_Id(Long renterId);
    boolean existsByBookEntity_Id(Long bookId);

}
