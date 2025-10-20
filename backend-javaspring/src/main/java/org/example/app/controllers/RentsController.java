package org.example.app.controllers;

import lombok.RequiredArgsConstructor;
import org.example.app.models.requests.RentRequestDTO;
import org.example.app.models.responses.RentResponseDTO;
import org.example.app.services.RentService;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/book")
@RequiredArgsConstructor
public class RentsController {

    private final RentService service;

    public RentResponseDTO registerController(@RequestBody RentRequestDTO request) {
        return service.registerService(request);
    }
}
