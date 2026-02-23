package org.example.app.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.app.models.requests.AuthRequestDTO;
import org.example.app.models.responses.AuthResponseDTO;
import org.example.app.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService service;

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> loginController(@Valid @RequestBody AuthRequestDTO request) {
        AuthResponseDTO newAuth = service.loginService(request);
        return ResponseEntity.ok(newAuth);
    }

}
