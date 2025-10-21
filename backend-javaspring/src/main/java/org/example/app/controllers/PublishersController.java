package org.example.app.controllers;

import lombok.RequiredArgsConstructor;
import org.example.app.models.requests.PublisherRequestDTO;
import org.example.app.models.responses.PublisherResponseDTO;
import org.example.app.services.PublisherService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/publishers")
@RequiredArgsConstructor
public class PublishersController {

    private final PublisherService publisherService;

    @GetMapping
    public ResponseEntity<List<PublisherResponseDTO>> getAllPublishers() {
        List<PublisherResponseDTO> publishers = publisherService.getPublishersService();
        return ResponseEntity.ok(publishers);
    }

    @PostMapping("/register")
    public ResponseEntity<PublisherResponseDTO> createPublisher(@RequestBody PublisherRequestDTO request) {
        PublisherResponseDTO newPublisher = publisherService.registerService(request);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(newPublisher.id())
                .toUri();

        return ResponseEntity.created(location).body(newPublisher);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PublisherResponseDTO> updatePublisher(@PathVariable Long id, @RequestBody PublisherRequestDTO request) {
        PublisherResponseDTO updatedPublisher = publisherService.updateService(id, request);
        return ResponseEntity.ok(updatedPublisher);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePublisher(@PathVariable Long id) {
        publisherService.deleteService(id);
        return ResponseEntity.noContent().build();
    }
}
