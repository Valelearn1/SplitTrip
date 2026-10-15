package com.splittrip.chat.dto;

import com.splittrip.chat.ChatEventType;
import com.splittrip.chat.ChatMessage;
import com.splittrip.chat.ChatMessageKind;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

public record MessageResponse(UUID id, ChatMessageKind kind, UUID authorParticipantId, String authorName, UUID authorUserId,
                              boolean authorHasAvatar, String content, ChatEventType eventType, UUID refId,
                              Instant createdAt, boolean deleted) {
    public static MessageResponse from(ChatMessage m, Set<UUID> usersWithAvatar) {
        var a = m.getAuthor();
        UUID userId = a == null ? null : a.userId();
        return new MessageResponse(m.getId(), m.getKind(), a == null ? null : a.getId(), a == null ? null : a.getDisplayName(),
                userId, userId != null && usersWithAvatar.contains(userId), m.getContent(), m.getEventType(), m.getRefId(),
                m.getCreatedAt(), m.isDeleted());
    }
}
