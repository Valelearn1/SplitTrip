package com.splittrip.photo.dto;

import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/** clear = true toglie luogo e coordinate; altrimenti servono nome e coordinate. */
public record PhotoPlaceRequest(@Size(max = 120) String placeName, BigDecimal latitude, BigDecimal longitude, Boolean clear) {}
