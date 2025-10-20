package org.example.app.services;

import lombok.RequiredArgsConstructor;
import org.example.app.models.requests.BookRequestDTO;
import org.example.app.models.entities.BookEntity;
import org.example.app.models.responses.BookResponseDTO;
import org.example.app.repositories.BookRepository;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;

import java.util.Optional;

@RequiredArgsConstructor
@Service
public class BooksService {

    private final BookRepository bookRepository;
    private final ModelMapper modelMapper;

    @PostMapping
    public BookResponseDTO registerService(BookRequestDTO register) {
        if (bookRepository.findByName(register.getName()).isPresent()) {
            throw new RuntimeException("Já existe um livro com esse nome.");
        }

        BookEntity entity = modelMapper.map(register, BookEntity.class);

        BookEntity savedEntity = bookRepository.save(entity);

        return modelMapper.map(savedEntity, BookResponseDTO.class);
    }

    @PutMapping
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

    @DeleteMapping
    public void deleteService(Long id) {
        if (!bookRepository.existsById(id)) {
            throw new RuntimeException("Livro com o id " + id + " não encontrado.");
        }

        bookRepository.deleteById(id);
    }
}
