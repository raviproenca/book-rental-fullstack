package org.example.app.services;

import lombok.RequiredArgsConstructor;
import org.example.app.models.entities.BookEntity;
import org.example.app.models.responses.BookResponseDTO;
import org.example.app.models.responses.MonthlyCountDTO;
import org.example.app.models.responses.RenterRentCountDTO;
import org.example.app.repositories.RentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@RequiredArgsConstructor
@Service
public class DashboardService {

    private final RentRepository rentRepository;

    public List<BookResponseDTO> getMostRentedBooks(int numberOfMonths) {
        LocalDate startDate = LocalDate.now().minusMonths(numberOfMonths);
        Pageable topThree = PageRequest.of(0, 3);
        Page<BookEntity> topBooksPage = rentRepository.findMostRentedBooks(topThree, startDate);
        List<BookEntity> bookEntities = topBooksPage.getContent();

        return bookEntities.stream().map(book -> new BookResponseDTO(
                book.getId(),
                book.getName(),
                book.getAuthor(),
                book.getLaunchDate(),
                book.getTotalQuantity(),
                book.getTotalInUse(),
                book.getPublisher()
        )).toList();
    }

    public List<MonthlyCountDTO> getDeliveredInTimeBooks(int numberOfMonths) {
        LocalDate startDate = LocalDate.now()
                .minusMonths(numberOfMonths - 1)
                .withDayOfMonth(1);
        return rentRepository.findDeliveredInTimeBooks(startDate);
    }

    public List<MonthlyCountDTO> getDeliveredWithDelayBooks(int numberOfMonths) {
        LocalDate startDate = LocalDate.now()
                .minusMonths(numberOfMonths - 1)
                .withDayOfMonth(1);
        return rentRepository.findDeliveredWithDelayBooks(startDate);
    }

    public Long getLateBooks(int numberOfMonths) {
        LocalDate startDate = LocalDate.now().minusMonths(numberOfMonths);
        return rentRepository.findLateBooks(startDate);
    }

    public List<RenterRentCountDTO> getRentsPerRenter() {
        return rentRepository.countRentsPerRenter();
    }

    public Long getAllRentsQuantity(int numberOfMonths) {
        LocalDate startDate = LocalDate.now().minusMonths(numberOfMonths);
        return rentRepository.findAllRentsQuantity(startDate);
    }
}