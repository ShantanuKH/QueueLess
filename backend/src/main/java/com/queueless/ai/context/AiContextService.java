package com.queueless.ai.context;

import com.queueless.ai.dto.AiQueueContext;
import com.queueless.queue.entity.Queue;
import com.queueless.queue.entity.QueueSession;
import com.queueless.queue.enums.QueueStatus;
import com.queueless.queue.enums.TokenStatus;
import com.queueless.queue.repository.QueueRepository;
import com.queueless.queue.repository.QueueSessionRepository;
import com.queueless.queue.repository.TokenRepository;
import com.queueless.service.entity.CenterService;
import com.queueless.service.repository.CenterServiceRepository;
import com.queueless.servicecenter.entity.ServiceCenter;
import com.queueless.servicecenter.repository.ServiceCenterRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AiContextService {

    private final CenterServiceRepository centerServiceRepository;
    private final ServiceCenterRepository serviceCenterRepository;
    private final QueueRepository queueRepository;
    private final QueueSessionRepository queueSessionRepository;
    private final TokenRepository tokenRepository;

    public AiContextService(
            CenterServiceRepository centerServiceRepository,
            ServiceCenterRepository serviceCenterRepository,
            QueueRepository queueRepository,
            QueueSessionRepository queueSessionRepository,
            TokenRepository tokenRepository
    ) {
        this.centerServiceRepository = centerServiceRepository;
        this.serviceCenterRepository = serviceCenterRepository;
        this.queueRepository = queueRepository;
        this.queueSessionRepository = queueSessionRepository;
        this.tokenRepository = tokenRepository;
    }

    public String buildQueueLessContext() {

        List<CenterService> services = centerServiceRepository.findAll();
        List<ServiceCenter> centers = serviceCenterRepository.findAll();
        List<Queue> queues = queueRepository.findAll();

        StringBuilder context = new StringBuilder();

        context.append("CURRENT QUEUELESS DATA\n\n");

        context.append("SERVICE CENTERS:\n");

        for (ServiceCenter center : centers) {
            context.append("- Center ID: ")
                    .append(center.getId())
                    .append("\n");

            context.append("  Name: ")
                    .append(center.getName())
                    .append("\n");

            context.append("  Description: ")
                    .append(center.getDescription())
                    .append("\n");

            context.append("  Address: ")
                    .append(center.getAddressLine())
                    .append(", ")
                    .append(center.getCity())
                    .append(", ")
                    .append(center.getState());

            if (center.getPostalCode() != null) {
                context.append(" - ")
                        .append(center.getPostalCode());
            }

            context.append("\n");

            context.append("  Status: ")
                    .append(center.getStatus())
                    .append("\n\n");
        }

        context.append("SERVICES:\n");

        for (CenterService service : services) {
            context.append("- Service ID: ")
                    .append(service.getId())
                    .append("\n");

            context.append("  Center ID: ")
                    .append(service.getCenterId())
                    .append("\n");

            context.append("  Name: ")
                    .append(service.getName())
                    .append("\n");

            context.append("  Description: ")
                    .append(service.getDescription())
                    .append("\n");

            context.append("  Estimated Service Time: ")
                    .append(service.getEstimatedServiceTimeMinutes())
                    .append(" minutes\n");

            context.append("  Status: ")
                    .append(service.getStatus())
                    .append("\n\n");
        }

        context.append("QUEUES:\n");

        for (Queue queue : queues) {
            context.append("- Queue ID: ")
                    .append(queue.getId())
                    .append("\n");

            context.append("  Service ID: ")
                    .append(queue.getServiceId())
                    .append("\n");

            context.append("  Status: ")
                    .append(queue.getStatus())
                    .append("\n");

            context.append("  Current Token Number: ")
                    .append(queue.getCurrentTokenNumber())
                    .append("\n");

            context.append("  Last Token Number: ")
                    .append(queue.getLastTokenNumber())
                    .append("\n\n");
        }

        return context.toString();
    }

    public List<CenterService> findMatchingServices(String searchTerm) {

        if (searchTerm == null || searchTerm.isBlank()) {
            return List.of();
        }

        return centerServiceRepository
                .findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
                        searchTerm.trim(),
                        searchTerm.trim()
                );
    }

    public ServiceCenter findServiceCenter(CenterService service) {

        return serviceCenterRepository
                .findById(service.getCenterId())
                .orElse(null);
    }

    public Queue findQueue(CenterService service) {

        return queueRepository.findAll()
                .stream()
                .filter(queue -> queue.getServiceId().equals(service.getId()))
                .findFirst()
                .orElse(null);
    }

    public String buildServiceQueueContext(CenterService service) {

        ServiceCenter center = findServiceCenter(service);
        Queue queue = findQueue(service);

        StringBuilder context = new StringBuilder();

        context.append("SERVICE:\n");

        context.append("Name: ")
                .append(service.getName())
                .append("\n");

        context.append("Description: ")
                .append(service.getDescription())
                .append("\n");

        context.append("Estimated Service Time: ")
                .append(service.getEstimatedServiceTimeMinutes())
                .append(" minutes\n");

        context.append("Service Status: ")
                .append(service.getStatus())
                .append("\n");

        if (center != null) {

            context.append("\nSERVICE CENTER:\n");

            context.append("Name: ")
                    .append(center.getName())
                    .append("\n");

            context.append("Address: ")
                    .append(center.getAddressLine())
                    .append(", ")
                    .append(center.getCity())
                    .append(", ")
                    .append(center.getState());

            if (center.getPostalCode() != null) {
                context.append(" - ")
                        .append(center.getPostalCode());
            }

            context.append("\n");

            context.append("Center Status: ")
                    .append(center.getStatus())
                    .append("\n");
        }

        if (queue != null) {

            context.append("\nQUEUE:\n");

            context.append("Queue Status: ")
                    .append(queue.getStatus())
                    .append("\n");

            context.append("Current Token Number: ")
                    .append(queue.getCurrentTokenNumber())
                    .append("\n");

            context.append("Last Token Number: ")
                    .append(queue.getLastTokenNumber())
                    .append("\n");

            context.append("Queue ID: ")
                    .append(queue.getId())
                    .append("\n");
        }

        return context.toString();
    }

    public AiQueueContext buildQueueContext(Queue queue) {

        QueueSession session = queueSessionRepository
                .findByQueueIdAndStatus(
                        queue.getId(),
                        QueueStatus.ACTIVE
                )
                .orElse(null);

        if (session == null) {

            return new AiQueueContext(
                    queue.getId(),
                    queue.getStatus().name(),
                    queue.getCurrentTokenNumber(),
                    queue.getLastTokenNumber(),
                    0,
                    0
            );
        }

        long peopleWaiting =
                tokenRepository.countByQueueSessionIdAndStatus(
                        session.getId(),
                        TokenStatus.WAITING
                );

        int estimatedWaitMinutes =
                (int) peopleWaiting * 5;

        return new AiQueueContext(
                queue.getId(),
                queue.getStatus().name(),
                queue.getCurrentTokenNumber(),
                queue.getLastTokenNumber(),
                peopleWaiting,
                estimatedWaitMinutes
        );
    }
}