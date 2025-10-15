package org.example.app.services;

import lombok.RequiredArgsConstructor;
import org.example.app.models.dtos.PublisherDTO;
import org.example.app.models.entities.PublisherEntity;
import org.example.app.repositories.PublisherRepository;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class PublishersService {

    private final PublisherRepository publisherRepository;
    private static final ModelMapper modelMapper = new ModelMapper();

    public PublisherEntity registerService(PublisherDTO register) {
        if (publisherRepository.findByEmail(register.getEmail()).isPresent()) {
            throw new RuntimeException("Email is already in use");
        }

        PublisherEntity entity = modelMapper.map(register, PublisherEntity.class);

        return publisherRepository.save(entity);
    }
}
