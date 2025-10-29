package org.example.app.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.app.config.security.JwtService;
import org.example.app.exceptions.BusinessRuleException;
import org.example.app.exceptions.ResourceNotFoundException;
import org.example.app.models.requests.AuthRequestDTO;
import org.example.app.models.requests.UserRequestDTO;
import org.example.app.models.entities.UserEntity;
import org.example.app.models.enums.UserRole;
import org.example.app.models.responses.AuthResponseDTO;
import org.example.app.models.responses.UserResponseDTO;
import org.example.app.repositories.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ModelMapper modelMapper;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Transactional
    public AuthResponseDTO loginService(AuthRequestDTO login) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        login.getEmail(),
                        login.getPassword()
                )
        );

        UserEntity userEntity = userRepository.findByEmail(login.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário com o email " + login.getEmail() + " não encontrado."));

        String jwtToken = jwtService.generateToken(userEntity);

        return new AuthResponseDTO(
                userEntity.getName(),
                userEntity.getRole().name(),
                userEntity.getEmail(),
                jwtToken
        );
    }

    @Transactional
    public List<UserResponseDTO> getUsersService() {
        List<UserEntity> entities = userRepository.findAll();

        return entities.stream()
                .map(user -> new UserResponseDTO(
                        user.getId(),
                        user.getName(),
                        user.getEmail(),
                        user.getRole().name()
                ))
                .toList();
    }

    @Transactional
    public UserResponseDTO registerService(UserRequestDTO register) {

        if (userRepository.findByEmail(register.getEmail()).isPresent()) {
            throw new BusinessRuleException("Esse email já está em uso por outro usuário.");
        }

        UserEntity newUser = modelMapper.map(register, UserEntity.class);
        newUser.setPassword(passwordEncoder.encode(register.getPassword()));

        try {
            UserRole role = UserRole.valueOf(register.getRole());
            newUser.setRole(role);
        } catch (IllegalArgumentException e) {
            throw new BusinessRuleException("Tipo de permissão inválida.");
        }

        UserEntity savedEntity = userRepository.save(newUser);

        return new UserResponseDTO(
                savedEntity.getId(),
                savedEntity.getName(),
                savedEntity.getEmail(),
                savedEntity.getRole().name()
        );
    }

    @Transactional
    public UserResponseDTO updateService(Long id, UserRequestDTO update) {
        UserEntity existingUser = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário com o id " + id + " não encontrado."));

        Optional<UserEntity> userWithNewEmail = userRepository.findByEmail(update.getEmail());

        if (userWithNewEmail.isPresent() && !userWithNewEmail.get().getId().equals(existingUser.getId())) {
            throw new BusinessRuleException("Esse email já está em uso por outro usuário.");
        }

        modelMapper.map(update, existingUser);

        if (update.getPassword() != null && !update.getPassword().trim().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(update.getPassword()));
        }

        try {
            UserRole role = UserRole.valueOf(update.getRole());
            existingUser.setRole(role);
        } catch (IllegalArgumentException e) {
            throw new BusinessRuleException("Tipo de permissão inválida.");
        }

        UserEntity updatedEntity = userRepository.save(existingUser);

        return new UserResponseDTO(
                updatedEntity.getId(),
                updatedEntity.getName(),
                updatedEntity.getEmail(),
                updatedEntity.getRole().name()
        );
    }

    @Transactional
    public void deleteService(Long id, UserEntity loggedUserEmail) {
        UserEntity userToDelete = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário com o id " + id + " não encontrado."));

        if (userToDelete.getId().equals(loggedUserEmail.getId())) {
            throw new BusinessRuleException("Você não pode excluir o seu próprio usuário enquanto logado.");
        }

        userRepository.deleteById(id);
    }
}