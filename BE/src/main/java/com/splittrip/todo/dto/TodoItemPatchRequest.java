package com.splittrip.todo.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.UUID;

/**
 * Campi null = non toccare. assigneeParticipantId assegna; clearAssignee=true toglie l'assegnazione
 * (un null nel JSON non si distingue da un campo assente, come in ParticipantPatchRequest).
 */
public record TodoItemPatchRequest(
        @Pattern(regexp = ".*\\S.*", message = "non può essere vuoto") @Size(max = 120) String text,
        Boolean done,
        UUID assigneeParticipantId,
        Boolean clearAssignee) {}
