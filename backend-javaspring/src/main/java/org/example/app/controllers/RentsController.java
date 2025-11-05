package org.example.app.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.app.models.requests.RentRequestDTO;
import org.example.app.models.requests.RentUpdateDTO;
import org.example.app.models.responses.RentResponseDTO;
import org.example.app.services.RentService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/rent")
@RequiredArgsConstructor
public class RentsController {

    private final RentService rentService;

    @GetMapping
    public ResponseEntity<Page<RentResponseDTO>> getAllRents(
            @PageableDefault(size = 10, page = 0, sort = {"name"}) Pageable pageable,
            @RequestParam(required = false) String search
    ) {
        Page<RentResponseDTO> rents = rentService.getRentsService(pageable, search);
        return ResponseEntity.ok(rents);
    }

    @PostMapping
    public ResponseEntity<RentResponseDTO> createRent(@Valid @RequestBody RentRequestDTO request) {
        RentResponseDTO newRent = rentService.registerService(request);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(newRent.id())
                .toUri();

        return ResponseEntity.created(location).body(newRent);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RentResponseDTO> updateRent(@PathVariable("id") Long id, @Valid @RequestBody RentUpdateDTO request) {
        RentResponseDTO updatedRent = rentService.updateService(id, request);
        return ResponseEntity.ok(updatedRent);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<RentResponseDTO> returnRent(@PathVariable("id") Long id) {
        RentResponseDTO returnedRent = rentService.returnBookService(id);
        return ResponseEntity.ok(returnedRent);
    }

}