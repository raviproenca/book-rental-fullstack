package org.example.app.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.app.exceptions.BusinessRuleException;
import org.example.app.exceptions.ResourceNotFoundException;
import org.example.app.models.entities.BookEntity;
import org.example.app.models.entities.RentEntity;
import org.example.app.models.entities.RenterEntity;
import org.example.app.models.enums.RentStatus;
import org.example.app.models.requests.RentRequestDTO;
import org.example.app.models.requests.RentUpdateDTO;
import org.example.app.models.responses.RentResponseDTO;
import org.example.app.repositories.BookRepository;
import org.example.app.repositories.RentRepository;
import org.example.app.repositories.RenterRepository;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@RequiredArgsConstructor
@Service
public class RentService {

    private final RentRepository rentRepository;
    private final BookRepository bookRepository;
    private final RenterRepository renterRepository;
    private final ModelMapper modelMapper;

    @Transactional
    public List<RentResponseDTO> getRentsService() {
        List<RentEntity> entities = rentRepository.findAll();

        return entities.stream()
                .map(rent -> new RentResponseDTO(
                        rent.getId(),
                        rent.getRenterEntity(),
                        rent.getBookEntity(),
                        rent.getDeadLine(),
                        rent.getDevolutionDate(),
                        rent.getRentDate(),
                        rent.getStatus().name()
                ))
                .toList();
    }

    @Transactional
    public RentResponseDTO registerService(RentRequestDTO register) {
        BookEntity book = bookRepository.findById(register.getBookId())
                .orElseThrow(() -> new ResourceNotFoundException("Livro com id " + register.getBookId() + " não encontrado."));

        RenterEntity renter = renterRepository.findById(register.getRenterId())
                .orElseThrow(() -> new ResourceNotFoundException("Locatário com id " + register.getRenterId() + " não encontrado."));

        int activeRentsCount = rentRepository.countActiveRentsByBookId(book.getId());

        if (activeRentsCount >= book.getTotalQuantity()) {
            throw new BusinessRuleException("Não há exemplares disponíveis para o livro '" + book.getName() + "'.");
        }

        RentEntity newRent = new RentEntity();
        newRent.setBookEntity(book);
        newRent.setRenterEntity(renter);
        newRent.setDeadLine(register.getDeadLine());
        newRent.setRentDate(LocalDate.now());
        newRent.setStatus(RentStatus.RENTED);
        RentEntity savedEntity = rentRepository.save(newRent);

        return new RentResponseDTO(
                savedEntity.getId(),
                savedEntity.getRenterEntity(),
                savedEntity.getBookEntity(),
                savedEntity.getDeadLine(),
                savedEntity.getDevolutionDate(),
                savedEntity.getRentDate(),
                savedEntity.getStatus().name()
        );
    }

    @Transactional
    public RentResponseDTO updateService(Long id, RentUpdateDTO update) {
        RentEntity existingRent = rentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Aluguél com o id " + id + " não encontrado."));

        BookEntity book = bookRepository.findById(update.getBookId())
                .orElseThrow(() -> new ResourceNotFoundException("Livro com id " + update.getBookId() + " não encontrado."));

        RenterEntity renter = renterRepository.findById(update.getRenterId())
                .orElseThrow(() -> new ResourceNotFoundException("Locatário com id " + update.getRenterId() + " não encontrado."));

        existingRent.setBookEntity(book);
        existingRent.setRenterEntity(renter);
        existingRent.setDeadLine(update.getDeadLine());
        existingRent.setDevolutionDate(update.getDevolutionDate());

        RentEntity updatedEntity = rentRepository.save(existingRent);

        return new RentResponseDTO(
                updatedEntity.getId(),
                updatedEntity.getRenterEntity(),
                updatedEntity.getBookEntity(),
                updatedEntity.getDeadLine(),
                updatedEntity.getDevolutionDate(),
                updatedEntity.getRentDate(),
                updatedEntity.getStatus().name()
        );
    }

    @Transactional
    public RentResponseDTO returnBookService(Long id) {
        RentEntity rent = rentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Aluguél com o id " + id + " não encontrado."));

        if (rent.getStatus() != RentStatus.RENTED && rent.getStatus() != RentStatus.LATE) {
            throw new BusinessRuleException("Este livro já foi devolvido ou o aluguel foi cancelado.");
        }

        LocalDate today = LocalDate.now();
        rent.setDevolutionDate(today);

        if (today.isAfter(rent.getDeadLine())) {
            rent.setStatus(RentStatus.DELIVERED_WITH_DELAY);
        } else {
            rent.setStatus(RentStatus.IN_TIME);
        }

        RentEntity updatedEntity = rentRepository.save(rent);

        return new RentResponseDTO(
                updatedEntity.getId(),
                updatedEntity.getRenterEntity(),
                updatedEntity.getBookEntity(),
                updatedEntity.getDeadLine(),
                updatedEntity.getDevolutionDate(),
                updatedEntity.getRentDate(),
                updatedEntity.getStatus().name()
        );
    }
}