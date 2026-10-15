package com.splittrip.live;

/** Busta di tutto ciò che passa sul canale di un viaggio: type = message.created | message.deleted | typing. */
public record LiveEnvelope(String type, Object data) {}
