package com.splittrip.expense;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/** Giorni o notti di presenza: intersezione tra le date del partecipante e quelle del viaggio (D-31). */
public final class PresenceCalculator {

    private PresenceCalculator() {}

    public static int count(LocalDate tripStart, LocalDate tripEnd, LocalDate arrival, LocalDate departure, DayBasis basis) {
        LocalDate from = arrival == null || arrival.isBefore(tripStart) ? tripStart : arrival;
        LocalDate to = departure == null || departure.isAfter(tripEnd) ? tripEnd : departure;
        if (to.isBefore(from)) {
            return 0;
        }
        int nights = (int) ChronoUnit.DAYS.between(from, to);
        return basis == DayBasis.NIGHTS ? nights : nights + 1;
    }
}
