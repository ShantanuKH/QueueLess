package com.queueless.servicecenter.repository;

import com.queueless.servicecenter.entity.ServiceCenter;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ServiceCenterRepository
        extends JpaRepository<ServiceCenter, UUID> {
}