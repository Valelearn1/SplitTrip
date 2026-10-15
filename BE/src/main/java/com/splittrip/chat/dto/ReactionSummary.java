package com.splittrip.chat.dto;

import java.util.List;
import java.util.UUID;

public record ReactionSummary(String emoji, long count, List<UUID> participantIds) {}
