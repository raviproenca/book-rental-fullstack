package org.example.app.services;

import lombok.RequiredArgsConstructor;
import org.example.app.models.requests.PublisherRequestDTO;
import org.example.app.models.entities.PublisherEntity;
import org.example.app.models.responses.PublisherResponseDTO;
import org.example.app.repositories.PublisherRepository;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class PublishersService {

    private final PublisherRepository publisherRepository;
    private final ModelMapper modelMapper;

    public PublisherResponseDTO registerService(PublisherRequestDTO register) {
        if (publisherRepository.findByEmail(register.getEmail()).isPresent()) {
            throw new RuntimeException("Email is already in use");
        }

        PublisherEntity entity = modelMapper.map(register, PublisherEntity.class);

        PublisherEntity savedEntity = publisherRepository.save(entity);

        return modelMapper.map(savedEntity, PublisherResponseDTO.class);
    }
}
