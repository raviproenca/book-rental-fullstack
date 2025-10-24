package org.example.app.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.app.models.entities.RenterEntity;
import org.example.app.models.requests.RenterRequestDTO;
import org.example.app.models.responses.RenterResponseDTO;
import org.example.app.repositories.RentRepository;
import org.example.app.repositories.RenterRepository;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
@Service
public class RenterService {

    private final RenterRepository renterRepository;
    private final RentRepository rentRepository;
    private final ModelMapper modelMapper;

    @Transactional
    public List<RenterResponseDTO> getRentersService() {
        List<RenterEntity> entities = renterRepository.findAll();

        return entities.stream()
                .map(renter -> new RenterResponseDTO(
                        renter.getId(),
                        renter.getName(),
                        renter.getEmail(),
                        renter.getTelephone(),
                        renter.getAddress(),
                        renter.getCpf()
                ))
                .toList();
    }

    @Transactional
    public RenterResponseDTO registerService(RenterRequestDTO register) {
        if (renterRepository.findByEmail(register.getEmail()).isPresent()) {
            throw new RuntimeException("Já existe um locatário com esse email.");
        }

        RenterEntity entity = modelMapper.map(register, RenterEntity.class);

        RenterEntity savedEntity = renterRepository.save(entity);

        return new RenterResponseDTO(
                savedEntity.getId(),
                savedEntity.getName(),
                savedEntity.getEmail(),
                savedEntity.getTelephone(),
                savedEntity.getAddress(),
                savedEntity.getCpf()
        );
    }

    @Transactional
    public RenterResponseDTO updateService(Long id, RenterRequestDTO update) {
        RenterEntity existingRenter = renterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Locatário com o id " + id + " não encontrado."));

        Optional<RenterEntity> renterWithNewEmail = renterRepository.findByEmail(update.getEmail());

        if (renterWithNewEmail.isPresent() && !renterWithNewEmail.get().getId().equals(existingRenter.getId())) {
            throw new RuntimeException("Já existe um locatário com esse email.");
        }

        modelMapper.map(update, existingRenter);

        RenterEntity updatedEntity = renterRepository.save(existingRenter);

        return new RenterResponseDTO(
                updatedEntity.getId(),
                updatedEntity.getName(),
                updatedEntity.getEmail(),
                updatedEntity.getTelephone(),
                updatedEntity.getAddress(),
                updatedEntity.getCpf()
        );
    }

    @Transactional
    public void deleteService(Long id) {
        if (!renterRepository.existsById(id)) {
            throw new RuntimeException("Locatário com o id " + id + " não encontrado.");
        }

        if (rentRepository.existsByRenterEntity_Id(id)) {
            throw new RuntimeException("Locatário com o id " + id + " está vinculado a um aluguel e não pode ser deletado.");
        }

        renterRepository.deleteById(id);
    }
}
