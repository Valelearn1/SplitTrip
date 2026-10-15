package com.splittrip.user.dto;

import java.math.BigDecimal;
import java.util.List;

/** spending: una riga per valuta, mai importi di valute diverse sommati tra loro. */
public record StatsResponse(long trips, List<Destination> destinations, List<Spending> spending, long photos) {
    public record Destination(String name, BigDecimal latitude, BigDecimal longitude) {}
    public record Spending(String currency, BigDecimal groupTotal, BigDecimal myShare) {}
}
