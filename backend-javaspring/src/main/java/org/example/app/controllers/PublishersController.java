package org.example.app.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.app.models.requests.PublisherRequestDTO;
import org.example.app.models.responses.PublisherResponseDTO;
import org.example.app.services.PublisherService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/publisher")
@RequiredArgsConstructor
public class PublishersController {

    private final PublisherService publisherService;

    @GetMapping
    public ResponseEntity<Page<PublisherResponseDTO>> getAllPublishers(
            @PageableDefault(size = 10, page = 0, sort = {"name"}) Pageable pageable,
            @RequestParam(required = false) String search
    ) {
        Page<PublisherResponseDTO> publishers = publisherService.getPublishersService(pageable, search);
        return ResponseEntity.ok(publishers);
    }

    @PostMapping
    public ResponseEntity<PublisherResponseDTO> createPublisher(@Valid @RequestBody PublisherRequestDTO request) {
        PublisherResponseDTO newPublisher = publisherService.registerService(request);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(newPublisher.id())
                .toUri();

        return ResponseEntity.created(location).body(newPublisher);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PublisherResponseDTO> updatePublisher(@PathVariable("id") Long id, @Valid @RequestBody PublisherRequestDTO request) {
        PublisherResponseDTO updatedPublisher = publisherService.updateService(id, request);
        return ResponseEntity.ok(updatedPublisher);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePublisher(@PathVariable("id") Long id) {
        publisherService.deleteService(id);
        return ResponseEntity.noContent().build();
    }
}
