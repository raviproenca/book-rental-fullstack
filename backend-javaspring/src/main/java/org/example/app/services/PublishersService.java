package org.example.app.services;

import lombok.RequiredArgsConstructor;
import org.example.app.models.dtos.PublisherDTO;
import org.example.app.models.entities.PublisherEntity;
import org.example.app.repositories.PublisherRepository;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class PublishersService {

    private final PublisherRepository publisherRepository;

    public PublisherEntity registerService(PublisherDTO register) {
        if (publisherRepository.findByEmail(register.getEmail()).isPresent()) {
            throw new RuntimeException("Email is already in use");
        }

        PublisherEntity entity = new PublisherEntity();
        entity.setName(register.getName());
        entity.setEmail(register.getEmail());
        entity.setTelephone(register.getTelephone());
        if (Boolean.parseBoolean(register.getSite())) {
            entity.setSite(register.getSite());
        }

        return publisherRepository.save(entity);
    }
}
