package org.example.app.services;

import lombok.RequiredArgsConstructor;
import org.example.app.models.entities.RentEntity;
import org.example.app.models.entities.RentEntity;
import org.example.app.models.requests.RentRequestDTO;
import org.example.app.models.requests.RentRequestDTO;
import org.example.app.models.responses.RentResponseDTO;
import org.example.app.models.responses.RentResponseDTO;
import org.example.app.repositories.RentRepository;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;

import java.util.Optional;

@RequiredArgsConstructor
@Service
public class RentsService {

    private final RentRepository rentRepository;
    private final ModelMapper modelMapper;

    @PostMapping
    public RentResponseDTO registerService(RentRequestDTO register) {
        RentEntity entity = modelMapper.map(register, RentEntity.class);

        RentEntity savedEntity = rentRepository.save(entity);

        return modelMapper.map(savedEntity, RentResponseDTO.class);
    }
    @PutMapping
    public RentResponseDTO updateService(Long id, RentRequestDTO update) {
        RentEntity existingRent = rentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário com o id " + id + " não encontrado."));

        Optional<RentEntity> rentWithNewName = rentRepository.findByName(update.getName());

        if (rentWithNewName.isPresent() && !rentWithNewName.get().getId().equals(existingRent.getId())) {
            throw new RuntimeException("Já existe um livro com esse nome.");
        }

        modelMapper.map(update, existingRent);

        RentEntity updatedRent = rentRepository.save(existingRent);

        return modelMapper.map(updatedRent, RentResponseDTO.class);
    }

}
