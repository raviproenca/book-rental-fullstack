package org.example.app.controllers;

import lombok.RequiredArgsConstructor;
import org.example.app.models.requests.BookRequestDTO;
import org.example.app.models.responses.BookResponseDTO;
import org.example.app.services.BooksService;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/book")
@RequiredArgsConstructor
public class BooksController {

    private final BooksService service;

    public BookResponseDTO registerController(@RequestBody BookRequestDTO request) {
        return service.registerService(request);
    }
}
