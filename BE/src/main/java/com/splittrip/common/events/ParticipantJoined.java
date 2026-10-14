package com.splittrip.common.events;

import java.util.List;
import java.util.UUID;

/** Qualcuno è entrato nel viaggio (anche rivendicando un posto). recipientUserIds: gli attivi con account. */
public record ParticipantJoined(UUID tripId, UUID joinedUserId, String joinedName, List<UUID> recipientUserIds) {
    public ParticipantJoined {
        recipientUserIds = List.copyOf(recipientUserIds);
    }
}
