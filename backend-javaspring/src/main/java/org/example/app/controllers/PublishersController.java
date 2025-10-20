package org.example.app.controllers;

import lombok.RequiredArgsConstructor;
import org.example.app.models.requests.PublisherRequestDTO;
import org.example.app.models.responses.PublisherResponseDTO;
import org.example.app.services.PublisherService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/publisher")
@RequiredArgsConstructor
public class PublishersController {

    private final PublisherService service;

    @PostMapping("/register")
    public PublisherResponseDTO registerController(@RequestBody PublisherRequestDTO request) {
        return service.registerService(request);
    }
}
