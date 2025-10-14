package org.example.app.services;

import lombok.RequiredArgsConstructor;
import org.example.app.models.entities.UserEntity;
import org.example.app.repositories.AuthUserRepository;
import org.example.app.models.dtos.AuthDTO;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@RequiredArgsConstructor
@Service
public class AuthService {

    private final AuthUserRepository authUserRepository;
    private final PasswordEncoder passwordEncoder;

    public UserEntity loginService(AuthDTO login) {
        UserEntity userEntity = authUserRepository.findByEmail(login.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuário com o email " + login.getEmail() + " não encontrado."));

        if (!passwordEncoder.matches(login.getPassword(), userEntity.getPasswordHash())) {
            throw new RuntimeException("Senha inválida");
        }

        return userEntity;
    }
}