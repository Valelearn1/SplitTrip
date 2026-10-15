package com.splittrip.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface MessageReactionRepository extends JpaRepository<MessageReaction, MessageReactionId> {

    /** (messageId, emoji, participantId) per un insieme di messaggi: una query per pagina. */
    @Query("select r.message.id, r.emoji, r.participant.id from MessageReaction r where r.message.id in :messageIds order by r.createdAt")
    List<Object[]> findByMessageIds(Collection<UUID> messageIds);

    @Modifying
    @Query("delete from MessageReaction r where r.message.id = :messageId and r.participant.id = :participantId and r.emoji = :emoji")
    int deleteOne(UUID messageId, UUID participantId, String emoji);

    /** Idempotente anche con due tocchi insieme: il conflitto sulla chiave non fallisce (né invalida la transazione). */
    @Modifying
    @Query(value = """
            insert into message_reactions (message_id, participant_id, emoji, created_at)
            values (:messageId, :participantId, :emoji, :now) on conflict do nothing
            """, nativeQuery = true)
    int insertIfAbsent(UUID messageId, UUID participantId, String emoji, Instant now);
}
