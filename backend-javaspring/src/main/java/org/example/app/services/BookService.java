package org.example.app.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.app.exceptions.BusinessRuleException;
import org.example.app.exceptions.ResourceNotFoundException;
import org.example.app.models.entities.PublisherEntity;
import org.example.app.models.entities.BookEntity;
import org.example.app.models.entities.UserEntity;
import org.example.app.models.requests.BookRequestDTO;
import org.example.app.models.responses.BookResponseDTO;
import org.example.app.models.responses.UserResponseDTO;
import org.example.app.repositories.BookRepository;
import org.example.app.repositories.PublisherRepository;
import org.example.app.repositories.RentRepository;
import org.example.app.specifications.BookSpecifications;
import org.example.app.specifications.UserSpecifications;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
@Service
public class BookService {

    private final BookRepository bookRepository;
    private final PublisherRepository publisherRepository;
    private final RentRepository rentRepository;
    private final ModelMapper modelMapper;

    @Transactional
    public Page<BookResponseDTO> getBooksService(Pageable pageable, String search) {
        Specification<BookEntity> spec = BookSpecifications.byGlobalSearch(search);

        Page<BookEntity> bookPage = bookRepository.findAll(spec, pageable);

        return bookPage.map(entity -> new BookResponseDTO(
                entity.getId(),
                entity.getName(),
                entity.getAuthor(),
                entity.getLaunchDate(),
                entity.getTotalQuantity(),
                entity.getTotalInUse(),
                entity.getPublisher()
        ));
    }

    @Transactional
    public BookResponseDTO registerService(BookRequestDTO register) {
        if (bookRepository.findByName(register.getName()).isPresent()) {
            throw new BusinessRuleException("Já existe um livro com esse nome.");
        }

        PublisherEntity publisher = publisherRepository.findById(register.getPublisherId())
                .orElseThrow(() -> new ResourceNotFoundException("Editora com id " + register.getPublisherId() + " não encontrada."));

        BookEntity newBook = modelMapper.map(register, BookEntity.class);

        newBook.setPublisher(publisher);

        if (newBook.getTotalInUse() == null) {
            newBook.setTotalInUse(0);
        }

        BookEntity savedEntity = bookRepository.save(newBook);

        return new BookResponseDTO(
                savedEntity.getId(),
                savedEntity.getName(),
                savedEntity.getAuthor(),
                savedEntity.getLaunchDate(),
                savedEntity.getTotalQuantity(),
                savedEntity.getTotalInUse(),
                savedEntity.getPublisher()
        );
    }

    @Transactional
    public BookResponseDTO updateService(Long id, BookRequestDTO update) {
        BookEntity existingBook = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Livro com o id " + id + " não encontrado."));

        PublisherEntity publisher = publisherRepository.findById(update.getPublisherId())
                .orElseThrow(() -> new ResourceNotFoundException("Editora com id " + update.getPublisherId() + " não encontrada."));

        Optional<BookEntity> bookWithNewName = bookRepository.findByName(update.getName());

        if (bookWithNewName.isPresent() && !bookWithNewName.get().getId().equals(existingBook.getId())) {
            throw new BusinessRuleException("Já existe um livro com esse nome.");
        }

        if (update.getTotalQuantity() < existingBook.getTotalInUse()) {
            throw new BusinessRuleException("O estoque não pode ser menor do que o número de exemplares alugados");
        }

        existingBook.setName(update.getName());
        existingBook.setAuthor(update.getAuthor());
        existingBook.setTotalQuantity(update.getTotalQuantity());
        existingBook.setLaunchDate(update.getLaunchDate());
        existingBook.setPublisher(publisher);

        BookEntity updatedEntity = bookRepository.save(existingBook);

        return new BookResponseDTO(
                updatedEntity.getId(),
                updatedEntity.getName(),
                updatedEntity.getAuthor(),
                updatedEntity.getLaunchDate(),
                updatedEntity.getTotalQuantity(),
                updatedEntity.getTotalInUse(),
                updatedEntity.getPublisher()
        );
    }

    @Transactional
    public void deleteService(Long id) {
        if (!bookRepository.existsById(id)) {
            throw new ResourceNotFoundException("Livro com o id " + id + " não encontrado.");
        }

        if (rentRepository.existsByBookEntity_Id(id)) {
            throw new BusinessRuleException("Livro com o id " + id + " está vinculado a um aluguel e não pode ser deletado.");
        }

        bookRepository.deleteById(id);
    }
}