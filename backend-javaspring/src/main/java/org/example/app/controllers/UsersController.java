package org.example.app.controllers;

import org.example.app.models.requests.UserRequestDTO;
import org.example.app.models.responses.UserResponseDTO;
import org.example.app.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user")
public class UsersController {

    @Autowired
    private UserService service;

    @PostMapping
    public UserResponseDTO registerController(@RequestBody UserRequestDTO request) {
        return service.registerService(request);
    }
}
