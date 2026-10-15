package com.splittrip.chat;

import java.io.Serializable;
import java.util.UUID;

public record MessageReactionId(UUID message, UUID participant, String emoji) implements Serializable {}
