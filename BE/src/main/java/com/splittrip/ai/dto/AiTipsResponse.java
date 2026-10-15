package com.splittrip.ai.dto;

import java.time.Instant;
import java.util.List;

public record AiTipsResponse(boolean available, int remainingToday, List<AiTip> tips, Instant generatedAt) {}
