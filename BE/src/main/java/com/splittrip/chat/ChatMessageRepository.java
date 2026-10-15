package com.splittrip.chat;

import org.springframework.data.domain.Limit;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {

    @EntityGraph(attributePaths = {"author", "author.user"})
    @Query("select m from ChatMessage m where m.trip.id = :tripId order by m.createdAt desc, m.id desc")
    List<ChatMessage> findLatest(UUID tripId, Limit limit);

    /** Pagina «più vecchi di»: (createdAt, id) strettamente minori del cursore. */
    @EntityGraph(attributePaths = {"author", "author.user"})
    @Query("""
            select m from ChatMessage m where m.trip.id = :tripId
              and (m.createdAt < :at or (m.createdAt = :at and m.id < :id))
            order by m.createdAt desc, m.id desc
            """)
    List<ChatMessage> findBefore(UUID tripId, Instant at, UUID id, Limit limit);

    @EntityGraph(attributePaths = {"author", "author.user"})
    Optional<ChatMessage> findByIdAndTripId(UUID id, UUID tripId);

    /** Non letti: dopo «letto fino a», esclusi i propri e gli eliminati; le righe evento contano. */
    @Query("""
            select count(m) from ChatMessage m where m.trip.id = :tripId and m.deletedAt is null
              and m.createdAt > :since and (m.author is null or m.author.id <> :me)
            """)
    long countUnread(UUID tripId, UUID me, Instant since);
}
