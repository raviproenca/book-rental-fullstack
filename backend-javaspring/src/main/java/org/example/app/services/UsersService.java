package org.example.app.services;

import lombok.RequiredArgsConstructor;
import org.example.app.models.dtos.UserDTO;
import org.example.app.models.entities.UserEntity;
import org.example.app.models.entities.UserRole;
import org.example.app.repositories.AuthUserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class UsersService {

    private final AuthUserRepository authUserRepository;
    private final PasswordEncoder passwordEncoder;

    public UserEntity registerService(UserDTO register) {
        if (authUserRepository.findByEmail(register.getEmail()).isPresent()) {
            throw new RuntimeException("Email is already in use.");
        }

        UserEntity newUser = new UserEntity();

        newUser.setEmail(register.getEmail());
        newUser.setPasswordHash(passwordEncoder.encode(register.getPasswordHash()));

        try {
            UserRole role = UserRole.valueOf(register.getRole());
            newUser.setRole(role);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid user role provided");
        }


        return authUserRepository.save(newUser);
    }
}
