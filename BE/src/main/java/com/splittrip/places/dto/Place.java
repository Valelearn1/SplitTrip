package com.splittrip.places.dto;

import java.math.BigDecimal;

public record Place(String name, String detail, BigDecimal latitude, BigDecimal longitude) {}
