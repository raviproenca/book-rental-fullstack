package org.example.app.controllers;

import org.example.app.models.dtos.AuthDTO;
import org.example.app.models.entities.UserEntity;
import org.example.app.services.AuthService;
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
    private AuthService service;

    @PostMapping("/login")
    public UserEntity LoginController(@RequestBody AuthDTO authDTO) {
        return service.loginService(authDTO);
    }

}
