package org.example.app.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.app.models.entities.UserEntity;
import org.example.app.models.requests.PublisherRequestDTO;
import org.example.app.models.entities.PublisherEntity;
import org.example.app.models.responses.PublisherResponseDTO;
import org.example.app.models.responses.UserResponseDTO;
import org.example.app.repositories.PublisherRepository;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
@Service
public class PublisherService {

    private final PublisherRepository publisherRepository;
    private final ModelMapper modelMapper;

    @Transactional
    public List<PublisherResponseDTO> getPublishersService() {
        List<PublisherEntity> entities = publisherRepository.findAll();

        return entities.stream()
                .map(publisher -> new PublisherResponseDTO(
                        publisher.getId(),
                        publisher.getName(),
                        publisher.getEmail(),
                        publisher.getTelephone(),
                        publisher.getSite()
                ))
                .toList();
    }

    @Transactional
    public PublisherResponseDTO registerService(PublisherRequestDTO register) {
        if (publisherRepository.findByEmail(register.getEmail()).isPresent()) {
            throw new RuntimeException("Esse email já está em uso por outra editora.");
        }

        PublisherEntity entity = modelMapper.map(register, PublisherEntity.class);

        PublisherEntity savedEntity = publisherRepository.save(entity);

        return new PublisherResponseDTO(
                savedEntity.getId(),
                savedEntity.getName(),
                savedEntity.getEmail(),
                savedEntity.getTelephone(),
                savedEntity.getSite()
        );
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

        PublisherEntity updatedEntity = publisherRepository.save(existingPublisher);

        return new PublisherResponseDTO(
                updatedEntity.getId(),
                updatedEntity.getName(),
                updatedEntity.getEmail(),
                updatedEntity.getTelephone(),
                updatedEntity.getSite()
        );
    }

    @Transactional
    public void deleteService(Long id) {
        if (!publisherRepository.existsById(id)) {
            throw new RuntimeException("Editora com o id " + id + " não encontrado.");
        }

        publisherRepository.deleteById(id);
    }
}
