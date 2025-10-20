package org.example.app.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.app.models.entities.RenterEntity;
import org.example.app.models.requests.RenterRequestDTO;
import org.example.app.models.responses.RenterResponseDTO;
import org.example.app.repositories.RenterRepository;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;

import java.util.Optional;

@RequiredArgsConstructor
@Service
public class RenterService {

    private final RenterRepository renterRepository;
    private final ModelMapper modelMapper;

    @Transactional
    public RenterResponseDTO registerService(RenterRequestDTO register) {
        if (renterRepository.findByEmail(register.getEmail()).isPresent()) {
            throw new RuntimeException("Já existe um locatário com esse email.");
        }

        RenterEntity entity = modelMapper.map(register, RenterEntity.class);

        RenterEntity savedEntity = renterRepository.save(entity);

        return modelMapper.map(savedEntity, RenterResponseDTO.class);
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

        RenterEntity updatedRenter = renterRepository.save(existingRenter);

        return modelMapper.map(updatedRenter, RenterResponseDTO.class);
    }

    @Transactional
    public void deleteService(Long id) {
        if (!renterRepository.existsById(id)) {
            throw new RuntimeException("Locatário com o id " + id + " não encontrado.");
        }

        renterRepository.deleteById(id);
    }
}
