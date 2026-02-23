package org.example.app.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.app.models.entities.UserEntity;
import org.example.app.models.requests.UserRequestDTO;
import org.example.app.models.responses.UserResponseDTO;
import org.example.app.services.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UsersController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<Page<UserResponseDTO>> getAllUsers(
            @PageableDefault(size = 10, page = 0, sort = {"name"}) Pageable pageable,
            @RequestParam(required = false) String search
    ) {
        Page<UserResponseDTO> users = userService.getUsersService(pageable, search);
        return ResponseEntity.ok(users);
    }

    @PostMapping
    public ResponseEntity<UserResponseDTO> createUser(@Valid @RequestBody UserRequestDTO request) {
        UserResponseDTO newUser = userService.registerService(request);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(newUser.id())
                .toUri();

        return ResponseEntity.created(location).body(newUser);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDTO> updateUser(@PathVariable("id") Long id, @Valid @RequestBody UserRequestDTO request) {
        UserResponseDTO updatedUser = userService.updateService(id, request);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable("id") Long id, @AuthenticationPrincipal UserEntity loggedUser) {
        userService.deleteService(id, loggedUser);
        return ResponseEntity.noContent().build();
    }
}