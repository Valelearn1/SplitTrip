package com.splittrip.common.events;

import java.util.UUID;

/** Una voce di lista è stata assegnata a un partecipante con account. */
public record TodoAssigned(UUID tripId, UUID listId, UUID actorUserId, String actorName, UUID assigneeUserId,
                           String itemText, String listTitle) {}
