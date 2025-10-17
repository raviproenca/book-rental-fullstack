package org.example.app.services;

import lombok.RequiredArgsConstructor;
import org.example.app.models.requests.AuthRequestDTO;
import org.example.app.models.requests.UserRequestDTO;
import org.example.app.models.entities.UserEntity;
import org.example.app.models.enums.UserRole;
import org.example.app.models.responses.AuthResponseDTO;
import org.example.app.models.responses.UserResponseDTO;
import org.example.app.repositories.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class UsersService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ModelMapper modelMapper;

    public AuthResponseDTO loginService(AuthRequestDTO login) {
        UserEntity userEntity = userRepository.findByEmail(login.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuário com o email " + login.getEmail() + " não encontrado."));

        if (!passwordEncoder.matches(login.getPassword(), userEntity.getPassword())) {
            throw new RuntimeException("Senha inválida");
        }

        return modelMapper.map(userEntity, AuthResponseDTO.class);
    }

    public UserResponseDTO registerService(UserRequestDTO register) {
        if (userRepository.findByEmail(register.getEmail()).isPresent()) {
            throw new RuntimeException("Esse email já está em uso.");
        }

        UserEntity newUser = modelMapper.map(register, UserEntity.class);

        newUser.setPassword(passwordEncoder.encode(register.getPassword()));

        try {
            UserRole role = UserRole.valueOf(register.getRole());
            newUser.setRole(role);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Tipo de permissão inválida.");
        }


        UserEntity savedEntity = userRepository.save(newUser);

        return modelMapper.map(savedEntity, UserResponseDTO.class);
    }
}
