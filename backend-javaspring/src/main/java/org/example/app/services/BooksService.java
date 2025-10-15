package org.example.app.services;

import lombok.RequiredArgsConstructor;
import org.example.app.repositories.BookRepository;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class BooksService {

    private final BookRepository bookRepository;
    private final ModelMapper modelMapper;
}
