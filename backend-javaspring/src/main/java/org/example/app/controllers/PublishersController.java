package org.example.app.controllers;

import lombok.RequiredArgsConstructor;
import org.example.app.models.requests.PublisherRequestDTO;
import org.example.app.models.responses.PublisherResponseDTO;
import org.example.app.services.PublishersService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/publisher")
@RequiredArgsConstructor
public class PublishersController {

    private final PublishersService service;

    @PostMapping("/register")
    public PublisherResponseDTO RegisterController(@RequestBody PublisherRequestDTO request) {
        return service.registerService(request);
    }
}
