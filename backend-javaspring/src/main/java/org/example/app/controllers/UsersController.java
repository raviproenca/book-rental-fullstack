package org.example.app.controllers;

import org.example.app.models.requests.UserRequestDTO;
import org.example.app.models.entities.UserEntity;
import org.example.app.services.UsersService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user")
public class UsersController {

    @Autowired
    private UsersService service;

    @PostMapping("/register")
    public UserEntity RegisterController(@RequestBody UserRequestDTO request) {
        return service.registerService(request);
    }
}
