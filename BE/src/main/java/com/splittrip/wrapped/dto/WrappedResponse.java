package com.splittrip.wrapped.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/** Il riepilogo di fine viaggio in una chiamata (D-53). Tutti gli importi nella valuta del viaggio. */
public record WrappedResponse(Trip trip, Totals totals, List<Category> byCategory, Record biggestExpense, Day priciestDay,
                              List<Moment> moments, List<Person> people, List<Badge> badges, Settlement settlement, Guess guess) {

    public record Trip(UUID id, String name, String destination, LocalDate startDate, LocalDate endDate, int nights, int people,
                       String currency, UUID coverPhotoId) {}
    public record Totals(BigDecimal groupTotal, BigDecimal perPerson, int expenseCount, int photos, int messages, int reactions) {}
    public record Category(String category, BigDecimal amount, int share) {}
    public record Record(String description, BigDecimal amount, String payerName) {}
    public record Day(LocalDate date, BigDecimal amount) {}
    public record Moment(UUID photoId, String caption, String placeName, BigDecimal latitude, BigDecimal longitude) {}
    /** joinedAt serve ai pari merito; non è esposto come dato utile ma non fa male. */
    public record Person(UUID participantId, String displayName, boolean hasAccount, UUID userId, Instant joinedAt,
                         BigDecimal paid, int photos, int messages, int reactionsReceived, BigDecimal foodPaid, int places) {}
    public enum BadgeCode { BANKER, PHOTOGRAPHER, VOICE, FOODIE, PUNCTUAL, LOVED, EXPLORER, COMPANION }
    public record Badge(UUID participantId, BadgeCode code, String title, String detail) {}
    public record Settlement(boolean settled, int openTransfers) {}
    public record GuessEntry(UUID participantId, String displayName, BigDecimal amount, BigDecimal diff) {}
    public record Guess(BigDecimal mine, int played, List<GuessEntry> others) {}
}
