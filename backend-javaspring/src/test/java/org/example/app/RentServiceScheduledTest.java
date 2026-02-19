package org.example.app;

import org.example.app.models.entities.RentEntity;
import org.example.app.models.enums.RentStatus;
import org.example.app.repositories.RentRepository;
import org.example.app.services.RentService;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

public class RentServiceScheduledTest {

    @InjectMocks
    private RentService rentService;

    @Mock
    private RentRepository rentRepository;

    @Test
    public void testCheckLateRents() throws Exception {
        try (AutoCloseable mocks = MockitoAnnotations.openMocks(this)) {
            RentEntity lateRent = new RentEntity();
            lateRent.setId(1L);
            lateRent.setStatus(RentStatus.RENTED);
            lateRent.setDeadLine(LocalDate.now().minusDays(1));

            when(rentRepository.findByStatusAndDeadLineBefore(eq(RentStatus.RENTED), any(LocalDate.class)))
                    .thenReturn(Collections.singletonList(lateRent));

            rentService.checkLateRents();

            verify(rentRepository, times(1)).save(lateRent);
            assert(lateRent.getStatus() == RentStatus.LATE);
        }
    }
}
