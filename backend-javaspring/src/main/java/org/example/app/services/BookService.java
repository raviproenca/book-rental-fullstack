package org.example.app.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.app.models.entities.PublisherEntity;
import org.example.app.models.requests.BookRequestDTO;
import org.example.app.models.entities.BookEntity;
import org.example.app.models.responses.BookResponseDTO;
import org.example.app.repositories.BookRepository;
import org.example.app.repositories.PublisherRepository;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.Optional;

@RequiredArgsConstructor
@Service
public class BookService {

    private final BookRepository bookRepository;
    private final PublisherRepository publisherRepository;
    private final ModelMapper modelMapper;

    @Transactional
    public BookResponseDTO registerService(BookRequestDTO register) {
        if (bookRepository.findByName(register.getName()).isPresent()) {
            throw new RuntimeException("Já existe um livro com esse nome.");
        }

        PublisherEntity publisher = publisherRepository.findById(register.getPublisherId())
                .orElseThrow(() -> new RuntimeException("Editora com id " + register.getPublisherId() + " não encontrado."));

        BookEntity newBook = modelMapper.map(register, BookEntity.class);
        newBook.setPublisher(publisher);

        BookEntity savedEntity = bookRepository.save(newBook);

        return modelMapper.map(savedEntity, BookResponseDTO.class);
    }

    @Transactional
    public BookResponseDTO updateService(Long id, BookRequestDTO update) {
        BookEntity existingBook = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário com o id " + id + " não encontrado."));

        Optional<BookEntity> bookWithNewName = bookRepository.findByName(update.getName());

        if (bookWithNewName.isPresent() && !bookWithNewName.get().getId().equals(existingBook.getId())) {
            throw new RuntimeException("Já existe um livro com esse nome.");
        }

        modelMapper.map(update, existingBook);

        BookEntity updatedBook = bookRepository.save(existingBook);

        return modelMapper.map(updatedBook, BookResponseDTO.class);
    }

    @Transactional
    public void deleteService(Long id) {
        if (!bookRepository.existsById(id)) {
            throw new RuntimeException("Livro com o id " + id + " não encontrado.");
        }

        bookRepository.deleteById(id);
    }
}
