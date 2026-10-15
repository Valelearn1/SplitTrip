package com.splittrip.photo.dto;

import com.splittrip.photo.PhotoKind;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/** Solo metadati: i byte si scaricano da /image e /thumbnail. */
public record PhotoResponse(UUID id, PhotoKind kind, UUID expenseId, UUID uploaderId, String uploaderName, String caption,
                            Instant takenAt, BigDecimal latitude, BigDecimal longitude, String placeName, int width, int height,
                            Instant createdAt) {}
