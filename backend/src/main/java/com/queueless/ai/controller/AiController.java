package com.queueless.ai.controller;

import com.queueless.ai.dto.AiAssistantRequest;
import com.queueless.ai.dto.AiAssistantResponse;
import com.queueless.ai.service.AiService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/assistant")
    public AiAssistantResponse askAssistant(
            @RequestBody AiAssistantRequest request
    ) {
        return aiService.askAssistant(request.message());
    }
}