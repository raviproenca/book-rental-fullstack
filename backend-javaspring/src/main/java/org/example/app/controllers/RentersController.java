package org.example.app.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.app.models.requests.RenterRequestDTO;
import org.example.app.models.responses.RenterResponseDTO;
import org.example.app.services.RenterService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/renter")
@RequiredArgsConstructor
public class RentersController {

    private final RenterService renterService;

    @GetMapping
    public ResponseEntity<List<RenterResponseDTO>> getAllRenters() {
        List<RenterResponseDTO> renters = renterService.getRentersService();
        return ResponseEntity.ok(renters);
    }

    @PostMapping
    public ResponseEntity<RenterResponseDTO> createRenter(@Valid @RequestBody RenterRequestDTO request) {
        RenterResponseDTO newRenter = renterService.registerService(request);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(newRenter.id())
                .toUri();

        return ResponseEntity.created(location).body(newRenter);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RenterResponseDTO> updateRenter(@PathVariable("id") Long id, @Valid @RequestBody RenterRequestDTO request) {
        RenterResponseDTO updatedRenter = renterService.updateService(id, request);
        return ResponseEntity.ok(updatedRenter);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRenter(@PathVariable("id") Long id) {
        renterService.deleteService(id);
        return ResponseEntity.noContent().build();
    }
}