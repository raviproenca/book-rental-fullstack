package org.example.app.services;

import lombok.RequiredArgsConstructor;
import org.example.app.models.entities.UserEntity;
import org.example.app.repositories.AuthRepository;
import org.example.app.models.dtos.AuthDTO;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@RequiredArgsConstructor
@Service
public class AuthService {

    private final AuthRepository authRepository;
    private final PasswordEncoder passwordEncoder;

    public UserEntity loginService(AuthDTO login) {
        UserEntity userEntity = authRepository.findByEmail(login.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuário com o email " + login.getEmail() + " não encontrado."));

        if (!passwordEncoder.matches(login.getPassword(), userEntity.getPassword())) {
            throw new RuntimeException("Senha inválida");
        }

        return userEntity;
    }
}