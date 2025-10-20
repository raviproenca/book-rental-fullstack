package org.example.app.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.app.models.requests.PublisherRequestDTO;
import org.example.app.models.entities.PublisherEntity;
import org.example.app.models.responses.PublisherResponseDTO;
import org.example.app.repositories.PublisherRepository;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;

import java.util.Optional;

@RequiredArgsConstructor
@Service
public class PublisherService {

    private final PublisherRepository publisherRepository;
    private final ModelMapper modelMapper;

    @Transactional
    public PublisherResponseDTO registerService(PublisherRequestDTO register) {
        if (publisherRepository.findByEmail(register.getEmail()).isPresent()) {
            throw new RuntimeException("Esse email já está em uso por outra editora.");
        }

        PublisherEntity entity = modelMapper.map(register, PublisherEntity.class);

        PublisherEntity savedEntity = publisherRepository.save(entity);

        return modelMapper.map(savedEntity, PublisherResponseDTO.class);
    }

    @Transactional
    public PublisherResponseDTO updateService(Long id, PublisherRequestDTO update) {
        PublisherEntity existingPublisher = publisherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Editora com o id " + id + " não encontrado."));

        Optional<PublisherEntity> publisherWithNewEmail = publisherRepository.findByEmail(update.getEmail());

        if (publisherWithNewEmail.isPresent() && !publisherWithNewEmail.get().getId().equals(existingPublisher.getId())) {
            throw new RuntimeException("Esse email já está em uso por outra editora.");
        }

        modelMapper.map(update, existingPublisher);

        PublisherEntity updatedPublisher = publisherRepository.save(existingPublisher);

        return modelMapper.map(updatedPublisher, PublisherResponseDTO.class);
    }

    @Transactional
    public void deleteService(Long id) {
        if (!publisherRepository.existsById(id)) {
            throw new RuntimeException("Editora com o id " + id + " não encontrado.");
        }

        publisherRepository.deleteById(id);
    }
}
