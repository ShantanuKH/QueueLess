package com.queueless.service.repository;

import com.queueless.service.entity.CenterService;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CenterServiceRepository
        extends JpaRepository<CenterService, UUID> {

    List<CenterService> findByCenterId(UUID centerId);

    List<CenterService> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            String name,
            String description
    );
}