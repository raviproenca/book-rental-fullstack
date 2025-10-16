package org.example.app.services;

import lombok.RequiredArgsConstructor;
import org.example.app.models.requests.BookRequestDTO;
import org.example.app.models.entities.BookEntity;
import org.example.app.repositories.BookRepository;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class BooksService {

    private final BookRepository bookRepository;
    private final ModelMapper modelMapper;

    public BookEntity registerService(BookRequestDTO register) {
        if (bookRepository.findById(    register.getName()).isPresent()) {

        }
    }
}
