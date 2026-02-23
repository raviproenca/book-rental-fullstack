package org.example.app.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.app.models.requests.BookRequestDTO;
import org.example.app.models.responses.BookResponseDTO;
import org.example.app.services.BookService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/book")
@RequiredArgsConstructor
public class BooksController {

    private final BookService bookService;

    @GetMapping
    public ResponseEntity<Page<BookResponseDTO>> getAllBooks(
            @PageableDefault(size = 10, page = 0, sort = {"name"}) Pageable pageable,
            @RequestParam(required = false) String search
    ) {
        Page<BookResponseDTO> books = bookService.getBooksService(pageable, search);
        return ResponseEntity.ok(books);
    }

    @PostMapping
    public ResponseEntity<BookResponseDTO> createBook(@Valid @RequestBody BookRequestDTO request) {
        BookResponseDTO newBook = bookService.registerService(request);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(newBook.id())
                .toUri();

        return ResponseEntity.created(location).body(newBook);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BookResponseDTO> updateBook(@PathVariable("id") Long id, @Valid @RequestBody BookRequestDTO request) {
        BookResponseDTO updatedBook = bookService.updateService(id, request);
        return ResponseEntity.ok(updatedBook);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable("id") Long id) {
        bookService.deleteService(id);
        return ResponseEntity.noContent().build();
    }
}