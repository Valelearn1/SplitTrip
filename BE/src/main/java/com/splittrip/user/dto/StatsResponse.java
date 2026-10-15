package com.splittrip.user.dto;

import java.math.BigDecimal;
import java.util.List;

public record StatsResponse(long trips, List<Destination> destinations, BigDecimal groupTotal, BigDecimal myShare, long photos) {
    public record Destination(String name, BigDecimal latitude, BigDecimal longitude) {}
}
