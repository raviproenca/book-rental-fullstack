package org.example.app.controllers;

import org.example.app.models.requests.AuthRequestDTO;
import org.example.app.models.entities.UserEntity;
import org.example.app.models.responses.AuthResponseDTO;
import org.example.app.services.UsersService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UsersService service;

    @PostMapping("/login")
    public AuthResponseDTO roginController(@RequestBody AuthRequestDTO request) {
        return service.loginService(request);
    }

}
