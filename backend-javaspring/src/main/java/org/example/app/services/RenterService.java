package org.example.app.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.app.exceptions.BusinessRuleException;
import org.example.app.exceptions.ResourceNotFoundException;
import org.example.app.models.entities.RenterEntity;
import org.example.app.models.requests.RenterRequestDTO;
import org.example.app.models.responses.RenterResponseDTO;
import org.example.app.repositories.RentRepository;
import org.example.app.repositories.RenterRepository;
import org.example.app.specifications.RenterSpecifications;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
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
    public Page<RenterResponseDTO> getRentersService(Pageable pageable, String search) {
        Specification<RenterEntity> spec = RenterSpecifications.byGlobalSearch(search);

        Page<RenterEntity> renterPage = renterRepository.findAll(spec, pageable);

        return renterPage.map(entity -> modelMapper.map(entity, RenterResponseDTO.class));
    }

    @Transactional
    public RenterResponseDTO registerService(RenterRequestDTO register) {
        if (renterRepository.findByEmail(register.getEmail()).isPresent()) {
            throw new BusinessRuleException("Já existe um locatário com esse email.");
        }

        if(renterRepository.findByCpf(register.getCpf()).isPresent()) {
            throw new BusinessRuleException("Já existe um locatário com esse cpf.");
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
                .orElseThrow(() -> new ResourceNotFoundException("Locatário com o id " + id + " não encontrado."));

        Optional<RenterEntity> renterWithNewEmail = renterRepository.findByEmail(update.getEmail());

        if (renterWithNewEmail.isPresent() && !renterWithNewEmail.get().getId().equals(existingRenter.getId())) {
            throw new BusinessRuleException("Já existe um locatário com esse email.");
        }

        Optional<RenterEntity> renterWithNewCpf = renterRepository.findByCpf(update.getCpf());

        if (renterWithNewCpf.isPresent() && !renterWithNewCpf.get().getId().equals(existingRenter.getId())) {
            throw new BusinessRuleException("Já existe um locatário com esse cpf.");
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
            throw new ResourceNotFoundException("Locatário com o id " + id + " não encontrado.");
        }

        if (rentRepository.existsByRenterEntity_Id(id)) {
            throw new BusinessRuleException("Este locatário está vinculado a um ou mais aluguéis e não pode ser deletado.");
        }

        renterRepository.deleteById(id);
    }
}