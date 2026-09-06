//package com.queueless.queue.controller;
//
//import com.queueless.queue.entity.QueueSession;
//import com.queueless.queue.service.QueueSessionService;
//import lombok.RequiredArgsConstructor;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.access.prepost.PreAuthorize;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.UUID;
//@RestController
//@RequestMapping("/api/queues")
//@RequiredArgsConstructor
//public class QueueSessionController {
//
//    private final QueueSessionService queueSessionService;
//
//    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
//    @PostMapping("/{queueId}/sessions/open")
//    public ResponseEntity<QueueSession> openSession(
//            @PathVariable UUID queueId
//    ) {
//        return ResponseEntity
//                .status(HttpStatus.CREATED)
//                .body(queueSessionService.openSession(queueId));
//    }
//
//    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
//    @PatchMapping("/sessions/{sessionId}/close")
//    public ResponseEntity<QueueSession> closeSession(
//            @PathVariable UUID sessionId
//    ) {
//        return ResponseEntity.ok(
//                queueSessionService.closeSession(sessionId)
//        );
//    }
//}