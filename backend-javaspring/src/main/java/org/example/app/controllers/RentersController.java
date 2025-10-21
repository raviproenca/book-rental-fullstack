package org.example.app.controllers;

import lombok.RequiredArgsConstructor;
import org.example.app.models.requests.RenterRequestDTO;
import org.example.app.models.requests.RenterRequestDTO;
import org.example.app.models.responses.RenterResponseDTO;
import org.example.app.models.responses.RenterResponseDTO;
import org.example.app.services.RenterService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/renters")
@RequiredArgsConstructor
public class RentersController {

    private final RenterService renterService;

    @PostMapping
    public ResponseEntity<RenterResponseDTO> createRenter(@RequestBody RenterRequestDTO request) {
        RenterResponseDTO newRenter = renterService.registerService(request);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(newRenter.getId())
                .toUri();

        return ResponseEntity.created(location).body(newRenter);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RenterResponseDTO> updateRenter(@PathVariable Long id, @RequestBody RenterRequestDTO request) {
        RenterResponseDTO updatedRenter = renterService.updateService(id, request);
        return ResponseEntity.ok(updatedRenter);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRenter(@PathVariable Long id) {
        renterService.deleteService(id);
        return ResponseEntity.noContent().build();
    }
}