package org.example.app.services;

import lombok.RequiredArgsConstructor;
import org.example.app.models.entities.RentEntity;
import org.example.app.models.requests.RentRequestDTO;
import org.example.app.models.responses.RentResponseDTO;
import org.example.app.repositories.RentRepository;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class RentsService {

    private final RentRepository rentRepository;
    private final ModelMapper modelMapper;

    public RentResponseDTO registerService(RentRequestDTO register) {
        RentEntity entity = modelMapper.map(register, RentEntity.class);

        RentEntity savedEntity = rentRepository.save(entity);

        return modelMapper.map(savedEntity, RentResponseDTO.class);
    }
}
