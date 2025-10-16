package org.example.app.controllers;

import org.example.app.models.requests.PublisherRequestDTO;
import org.example.app.models.entities.PublisherEntity;
import org.example.app.services.PublishersService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/publisher")
public class PublishersController {

    @Autowired
    private PublishersService service;

    @PostMapping("/register")
    public PublisherEntity RegisterController(@RequestBody PublisherRequestDTO request) {
        return service.registerService(request);
    }
}
