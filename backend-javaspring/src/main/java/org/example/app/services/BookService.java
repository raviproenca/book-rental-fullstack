package org.example.app.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.app.exceptions.BusinessRuleException;
import org.example.app.exceptions.ResourceNotFoundException;
import org.example.app.models.entities.PublisherEntity;
import org.example.app.models.entities.BookEntity;
import org.example.app.models.requests.BookRequestDTO;
import org.example.app.models.responses.BookResponseDTO;
import org.example.app.repositories.BookRepository;
import org.example.app.repositories.PublisherRepository;
import org.example.app.repositories.RentRepository;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

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
    public List<BookResponseDTO> getBooksService() {
        List<BookEntity> entities = bookRepository.findAll();

        return entities.stream()
                .map(book -> new BookResponseDTO(
                        book.getId(),
                        book.getName(),
                        book.getAuthor(),
                        book.getLaunchDate(),
                        book.getTotalQuantity(),
                        book.getTotalInUse(),
                        book.getPublisher()
                ))
                .toList();
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

        Optional<BookEntity> bookWithNewName = bookRepository.findByName(update.getName());

        if (bookWithNewName.isPresent() && !bookWithNewName.get().getId().equals(existingBook.getId())) {
            throw new BusinessRuleException("Já existe um livro com esse nome.");
        }

        modelMapper.map(update, existingBook);

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