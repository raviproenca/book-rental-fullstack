package org.example.app.services;

import jakarta.transaction.Transactional;
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
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;

import java.util.Optional;

@RequiredArgsConstructor
@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ModelMapper modelMapper;

    @Transactional
    public AuthResponseDTO loginService(AuthRequestDTO login) {
        UserEntity userEntity = userRepository.findByEmail(login.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuário com o email " + login.getEmail() + " não encontrado."));

        if (!passwordEncoder.matches(login.getPassword(), userEntity.getPassword())) {
            throw new RuntimeException("Senha inválida");
        }

        return modelMapper.map(userEntity, AuthResponseDTO.class);
    }

    @Transactional
    public UserResponseDTO registerService(UserRequestDTO register) {
        if (userRepository.findByEmail(register.getEmail()).isPresent()) {
            throw new RuntimeException("Esse email já está em uso por outro usuário.");
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

    @Transactional
    public UserResponseDTO updateService(Long id, UserRequestDTO update) {
        UserEntity existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário com o id " + id + " não encontrado."));

        Optional<UserEntity> userWithNewEmail = userRepository.findByEmail(update.getEmail());

        if (userWithNewEmail.isPresent() && !userWithNewEmail.get().getId().equals(existingUser.getId())) {
            throw new RuntimeException("Esse email já está em uso por outro usuário.");
        }

        modelMapper.map(update, existingUser);

        if (update.getPassword() != null && !update.getPassword().trim().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(update.getPassword()));
        }

        try {
            UserRole role = UserRole.valueOf(update.getRole());
            existingUser.setRole(role);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Tipo de permissão inválida.");
        }

        UserEntity updatedUser = userRepository.save(existingUser);

        return modelMapper.map(updatedUser, UserResponseDTO.class);
    }

    @Transactional
    public void deleteService(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("Usuário com o id " + id + " não encontrado.");
        }

        userRepository.deleteById(id);
    }
}
