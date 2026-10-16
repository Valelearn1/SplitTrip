package com.splittrip.wrapped;

import java.io.Serializable;
import java.util.UUID;

public record WrappedGuessId(UUID trip, UUID participant) implements Serializable {}
