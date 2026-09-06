//package com.queueless.queue.service;
//
//import com.queueless.queue.entity.QueueSession;
//import com.queueless.queue.enums.QueueStatus;
//import com.queueless.queue.exception.ActiveSessionAlreadyExistsException;
//import com.queueless.queue.exception.QueueSessionNotFoundException;
//import com.queueless.queue.repository.QueueSessionRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//
//import java.time.LocalDate;
//import java.time.LocalDateTime;
//import java.util.UUID;
//
//@Service
//@RequiredArgsConstructor
//public class QueueSessionService {
//
//    private final QueueSessionRepository queueSessionRepository;
//
//    public QueueSession openSession(UUID queueId) {
//
//        queueSessionRepository
//                .findByQueueIdAndStatus(
//                        queueId,
//                        QueueStatus.ACTIVE
//                )
//                .ifPresent(session -> {
//                    throw new ActiveSessionAlreadyExistsException(
//                            "Queue already has an active session"
//                    );
//                });
//
//        LocalDateTime now = LocalDateTime.now();
//
//        QueueSession session = QueueSession.builder()
//                .queueId(queueId)
//                .sessionDate(LocalDate.now())
//                .status(QueueStatus.ACTIVE)
//                .currentTokenNumber(0)
//                .lastTokenNumber(0)
//                .startedAt(now)
//                .createdAt(now)
//                .updatedAt(now)
//                .build();
//
//        return queueSessionRepository.save(session);
//    }
//
//    public QueueSession closeSession(UUID sessionId) {
//
//        QueueSession session = queueSessionRepository.findById(sessionId)
//                .orElseThrow(() ->
//                        new QueueSessionNotFoundException(
//                                "Queue session not found"
//                        )
//                );
//
//        if (session.getStatus() == QueueStatus.CLOSED) {
//            throw new IllegalStateException(
//                    "Queue session is already closed"
//            );
//        }
//
//        session.setStatus(QueueStatus.CLOSED);
//        session.setClosedAt(LocalDateTime.now());
//        session.setUpdatedAt(LocalDateTime.now());
//
//        return queueSessionRepository.save(session);
//    }
//}