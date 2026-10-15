package com.splittrip.chat.dto;

import java.util.List;

public record MessagePage(List<MessageResponse> items, boolean hasMore) {}
