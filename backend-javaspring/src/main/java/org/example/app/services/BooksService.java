package org.example.app.services;

import lombok.RequiredArgsConstructor;
import org.example.app.models.requests.BookRequestDTO;
import org.example.app.models.entities.BookEntity;
import org.example.app.models.responses.BookResponseDTO;
import org.example.app.repositories.BookRepository;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class BooksService {

    private final BookRepository bookRepository;
    private final ModelMapper modelMapper;

    public BookResponseDTO registerService(BookRequestDTO register) {
        if (bookRepository.findByName(register.getName()).isPresent()) {
            throw new RuntimeException("Book already exists");
        }

        BookEntity entity = modelMapper.map(register, BookEntity.class);

        BookEntity savedEntity = bookRepository.save(entity);

        return modelMapper.map(savedEntity, BookResponseDTO.class);
    }
}
