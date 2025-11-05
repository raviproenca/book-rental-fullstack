package org.example.app.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.app.exceptions.BusinessRuleException;
import org.example.app.exceptions.ResourceNotFoundException;
import org.example.app.models.entities.UserEntity;
import org.example.app.models.requests.PublisherRequestDTO;
import org.example.app.models.entities.PublisherEntity;
import org.example.app.models.responses.PublisherResponseDTO;
import org.example.app.models.responses.UserResponseDTO;
import org.example.app.repositories.BookRepository;
import org.example.app.repositories.PublisherRepository;
import org.example.app.specifications.PublisherSpecifications;
import org.example.app.specifications.UserSpecifications;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
@Service
public class PublisherService {

    private final PublisherRepository publisherRepository;
    private final BookRepository bookRepository;
    private final ModelMapper modelMapper;

    @Transactional
    public Page<PublisherResponseDTO> getPublishersService(Pageable pageable, String search) {
        Specification<PublisherEntity> spec = PublisherSpecifications.byGlobalSearch(search);

        Page<PublisherEntity> publisherPage = publisherRepository.findAll(spec, pageable);

        return publisherPage.map(entity -> new PublisherResponseDTO(
                entity.getId(),
                entity.getName(),
                entity.getEmail(),
                entity.getTelephone(),
                entity.getSite()
        ));
    }

    @Transactional
    public PublisherResponseDTO registerService(PublisherRequestDTO register) {

        if (publisherRepository.findByEmail(register.getEmail()).isPresent()) {
            throw new BusinessRuleException("Esse email já está em uso por outra editora.");
        }

        if (publisherRepository.findByName(register.getName()).isPresent()) {
            throw new BusinessRuleException("Esse nome já está em uso por outra editora.");
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
                .orElseThrow(() -> new ResourceNotFoundException("Editora com o id " + id + " não encontrada."));

        Optional<PublisherEntity> publisherWithNewEmail = publisherRepository.findByEmail(update.getEmail());

        if (publisherWithNewEmail.isPresent() && !publisherWithNewEmail.get().getId().equals(existingPublisher.getId())) {
            throw new BusinessRuleException("Já existe uma editora com esse email.");
        }

        Optional<PublisherEntity> publisherWithNewName = publisherRepository.findByName(update.getName());

        if (publisherWithNewName.isPresent() && !publisherWithNewName.get().getId().equals(existingPublisher.getId())) {
            throw new BusinessRuleException("Já existe um locatário com esse nome.");
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
            throw new ResourceNotFoundException("Editora com o id " + id + " não encontrada.");
        }

        if (bookRepository.existsByPublisher_Id(id)) {
            throw new BusinessRuleException("Esta editora está vinculada a um ou mais livros e não pode ser deletada.");
        }

        publisherRepository.deleteById(id);
    }
}