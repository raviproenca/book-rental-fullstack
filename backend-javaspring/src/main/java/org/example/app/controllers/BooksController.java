package org.example.app.controllers;

import lombok.RequiredArgsConstructor;
import org.example.app.models.requests.BookRequestDTO;
import org.example.app.models.requests.BookRequestDTO;
import org.example.app.models.responses.BookResponseDTO;
import org.example.app.models.responses.BookResponseDTO;
import org.example.app.services.BookService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/books")
@RequiredArgsConstructor
public class BooksController {

    private final BookService bookService;

    @PostMapping
    public ResponseEntity<BookResponseDTO> createBook(@RequestBody BookRequestDTO request) {
        BookResponseDTO newBook = bookService.registerService(request);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(newBook.getId())
                .toUri();

        return ResponseEntity.created(location).body(newBook);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BookResponseDTO> updateBook(@PathVariable Long id, @RequestBody BookRequestDTO request) {
        BookResponseDTO updatedBook = bookService.updateService(id, request);
        return ResponseEntity.ok(updatedBook);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        bookService.deleteService(id);
        return ResponseEntity.noContent().build();
    }
}