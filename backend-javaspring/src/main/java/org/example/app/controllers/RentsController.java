package org.example.app.controllers;

import lombok.RequiredArgsConstructor;
import org.example.app.models.requests.RentRequestDTO;
import org.example.app.models.requests.RentUpdateDTO;
import org.example.app.models.responses.RentResponseDTO;
import org.example.app.services.RentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/rents")
@RequiredArgsConstructor
public class RentsController {

    private final RentService rentService;

    @PostMapping
    public ResponseEntity<RentResponseDTO> createRent(@RequestBody RentRequestDTO request) {
        RentResponseDTO newRent = rentService.registerService(request);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(newRent.getId())
                .toUri();

        return ResponseEntity.created(location).body(newRent);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RentResponseDTO> updateRent(@PathVariable Long id, @RequestBody RentUpdateDTO request) {
        RentResponseDTO updatedRent = rentService.updateService(id, request);
        return ResponseEntity.ok(updatedRent);
    }

    public ResponseEntity<RentResponseDTO> returnRent(@PathVariable Long id) {
        RentResponseDTO returnedRent = rentService.returnBookService(id);
        return ResponseEntity.ok(returnedRent);
    }

}