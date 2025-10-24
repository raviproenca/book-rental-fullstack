package org.example.app.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.app.models.entities.BookEntity;
import org.example.app.models.responses.RenterRentCountDTO;
import org.example.app.repositories.RentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class DashboardService {

    private final RentRepository rentRepository;

    public List<BookEntity> getMostRentedBooks() {
        Pageable topThree = PageRequest.of(0, 3);
        Page<BookEntity> topBooksPage = rentRepository.findMostRentedBooks(topThree);
        return topBooksPage.getContent();
    }

    public Long getDeliveredInTimeBooks() {
        return rentRepository.findDeliveredInTimeBooks();
    }

    public Long getDeliveredWithDelayBooks() {
        return rentRepository.findDeliveredWithDelayBooks();
    }

    public Long getLateBooks() {
        return rentRepository.findLateBooks();
    }

    public List<RenterRentCountDTO> getRentsPerRenter() {
        return rentRepository.countRentsPerRenter();
    }

    public Long getAllRentsQuantity() {
        return rentRepository.findAllRentsQuantity();
    }
}
