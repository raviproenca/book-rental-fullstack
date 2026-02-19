package org.example.app;

import org.example.app.models.entities.BookEntity;
import org.example.app.models.entities.RentEntity;
import org.example.app.models.entities.RenterEntity;
import org.example.app.models.requests.RentRequestDTO;
import org.example.app.models.responses.RentResponseDTO;
import org.example.app.repositories.BookRepository;
import org.example.app.repositories.RentRepository;
import org.example.app.repositories.RenterRepository;
import org.example.app.services.RentService;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.modelmapper.ModelMapper;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

public class RentMappingTest {

    @InjectMocks
    private RentService rentService;

    @Mock
    private RentRepository rentRepository;
    @Mock
    private BookRepository bookRepository;
    @Mock
    private RenterRepository renterRepository;
    @Mock
    private ModelMapper modelMapper;

    @Test
    public void testRegisterServiceMapping() throws Exception {
        try (AutoCloseable mocks = MockitoAnnotations.openMocks(this)) {
            Long bookId = 1L;
            Long renterId = 1L;
            LocalDate deadLine = LocalDate.of(2026, 2, 17);
            
            RentRequestDTO request = new RentRequestDTO();
            request.setBookId(bookId);
            request.setRenterId(renterId);
            request.setDeadLine(deadLine);

            BookEntity book = new BookEntity();
            book.setId(bookId);
            book.setName("Test Book");
            book.setTotalQuantity(10);
            book.setTotalInUse(0);

            RenterEntity renter = new RenterEntity();
            renter.setId(renterId);

            when(bookRepository.findById(bookId)).thenReturn(Optional.of(book));
            when(renterRepository.findById(renterId)).thenReturn(Optional.of(renter));
            when(rentRepository.countActiveRentsByBookId(bookId)).thenReturn(0);
            
            when(rentRepository.save(any(RentEntity.class))).thenAnswer(invocation -> {
                RentEntity entity = invocation.getArgument(0);
                entity.setId(100L);
                return entity;
            });

            RentResponseDTO response = rentService.registerService(request);

            assertEquals(deadLine, response.deadLine(), "DeadLine field should match the requested deadline");

            assertNull(response.devolutionDate(), "DevolutionDate should be null for new rent");
        }
    }
}
