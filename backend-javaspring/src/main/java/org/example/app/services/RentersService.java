package org.example.app.services;

import lombok.RequiredArgsConstructor;
import org.example.app.models.entities.RenterEntity;
import org.example.app.models.requests.RenterRequestDTO;
import org.example.app.repositories.RenterRepository;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class RentersService{

    private final RenterRepository renterRepository;
    private final ModelMapper modelMapper;

    public RenterEntity registerService(RenterRequestDTO register) {
        if (renterRepository.findByEmail(register.getEmail()).isPresent()) {
            throw new RuntimeException("Email is already in use");
        }

        RenterEntity entity = modelMapper.map(register, RenterEntity.class);

        return renterRepository.save(entity);
    }
}
