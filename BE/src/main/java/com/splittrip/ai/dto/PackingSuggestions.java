package com.splittrip.ai.dto;

import java.util.List;

public record PackingSuggestions(List<String> items, int remainingToday) {}
