package com.queueless.ai.service;

import com.queueless.ai.context.AiContextService;
import com.queueless.ai.dto.AiAssistantResponse;
import com.queueless.ai.dto.AiQueueContext;
import com.queueless.ai.dto.AiServiceIntent;
import com.queueless.ai.prompt.AiIntentPrompt;
import com.queueless.ai.prompt.AiPromptBuilder;
import com.queueless.ai.prompt.AiSystemPrompt;
import com.queueless.queue.entity.Queue;
import com.queueless.service.entity.CenterService;
import com.queueless.servicecenter.entity.ServiceCenter;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class AiService {

    private final ChatClient chatClient;
    private final AiContextService aiContextService;
    private final AiPromptBuilder aiPromptBuilder;

    public AiService(
            ChatClient.Builder chatClientBuilder,
            AiContextService aiContextService,
            AiPromptBuilder aiPromptBuilder
    ) {
        this.chatClient = chatClientBuilder.build();
        this.aiContextService = aiContextService;
        this.aiPromptBuilder = aiPromptBuilder;
    }

    public AiAssistantResponse askAssistant(String message) {

        AiServiceIntent intent = chatClient
                .prompt()
                .system(AiIntentPrompt.SYSTEM_PROMPT)
                .user(message)
                .call()
                .entity(AiServiceIntent.class);

        String serviceSearchTerm = intent.serviceSearchTerm();

        if (serviceSearchTerm == null || serviceSearchTerm.isBlank()) {

            String queueLessContext =
                    aiContextService.buildQueueLessContext();

            String prompt =
                    aiPromptBuilder.buildPrompt(
                            message,
                            queueLessContext
                    );

            String response = chatClient
                    .prompt()
                    .system(AiSystemPrompt.SYSTEM_PROMPT)
                    .user(prompt)
                    .call()
                    .content();

            return new AiAssistantResponse(
                    response,
                    null
            );
        }

        List<CenterService> matchingServices =
                aiContextService.findMatchingServices(serviceSearchTerm);

        StringBuilder context = new StringBuilder();

        context.append(
                "MATCHING QUEUELESS SERVICES AND LIVE QUEUE DATA:\n\n"
        );

        if (matchingServices.isEmpty()) {

            context.append(
                    "No QueueLess service was found matching the requested service.\n"
            );

        } else {

            for (int i = 0; i < matchingServices.size(); i++) {

                CenterService service = matchingServices.get(i);

                ServiceCenter center =
                        aiContextService.findServiceCenter(service);

                Queue queue =
                        aiContextService.findQueue(service);

                context.append("OPTION ")
                        .append(i + 1)
                        .append(":\n\n");

                context.append("SERVICE:\n");

                context.append("Service Name: ")
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

                    context.append("Center Name: ")
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

                    AiQueueContext queueContext =
                            aiContextService.buildQueueContext(queue);

                    context.append("\nQUEUE:\n");

                    context.append("Queue ID: ")
                            .append(queueContext.queueId())
                            .append("\n");

                    context.append("Queue Status: ")
                            .append(queueContext.queueStatus())
                            .append("\n");

                    context.append("Current Token Number: ")
                            .append(queueContext.currentTokenNumber())
                            .append("\n");

                    context.append("Last Token Number: ")
                            .append(queueContext.lastTokenNumber())
                            .append("\n");

                    context.append("People Waiting: ")
                            .append(queueContext.peopleWaiting())
                            .append("\n");

                    context.append("Estimated Wait: ")
                            .append(queueContext.estimatedWaitMinutes())
                            .append(" minutes\n");

                } else {

                    context.append("\nQUEUE:\n");
                    context.append(
                            "No queue is currently available for this service.\n"
                    );
                }

                context.append("\n-------------------------\n\n");
            }
        }

        String prompt = aiPromptBuilder.buildPrompt(
                message,
                context.toString()
        );

        String response = chatClient
                .prompt()
                .system(AiSystemPrompt.SYSTEM_PROMPT)
                .user(prompt)
                .call()
                .content();

        UUID recommendedQueueId = null;

        if (!matchingServices.isEmpty()) {

            CenterService recommendedService =
                    matchingServices.stream()
                            .filter(service ->
                                    aiContextService.findQueue(service) != null
                            )
                            .min((service1, service2) -> {

                                Queue queue1 =
                                        aiContextService.findQueue(service1);

                                Queue queue2 =
                                        aiContextService.findQueue(service2);

                                AiQueueContext context1 =
                                        aiContextService.buildQueueContext(queue1);

                                AiQueueContext context2 =
                                        aiContextService.buildQueueContext(queue2);

                                return Integer.compare(
                                        context1.estimatedWaitMinutes(),
                                        context2.estimatedWaitMinutes()
                                );
                            })
                            .orElse(null);

            if (recommendedService != null) {

                Queue recommendedQueue =
                        aiContextService.findQueue(recommendedService);

                if (recommendedQueue != null) {
                    recommendedQueueId = recommendedQueue.getId();
                }
            }
        }

        return new AiAssistantResponse(
                response,
                recommendedQueueId
        );
    }
}