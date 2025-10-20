package org.example.app.controllers;

import lombok.RequiredArgsConstructor;
import org.example.app.models.requests.RenterRequestDTO;
import org.example.app.models.responses.RenterResponseDTO;
import org.example.app.services.RentersService;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/book")
@RequiredArgsConstructor
public class RentersController {

    private final RentersService service;

    public RenterResponseDTO RegisterController(@RequestBody RenterRequestDTO request) {
        return service.registerService(request);
    }
}
