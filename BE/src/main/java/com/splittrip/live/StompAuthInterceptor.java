package com.splittrip.live;

import com.splittrip.trip.ParticipantRepository;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageDeliveryException;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Component;

import java.security.Principal;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Controlla ogni frame in entrata (D-39): CONNECT con JWT, SUBSCRIBE e SEND solo dove sei membro.
 * Un'eccezione qui diventa un frame ERROR e Spring chiude la connessione.
 */
@Component
public class StompAuthInterceptor implements ChannelInterceptor {

    private static final Pattern TRIP_TOPIC = Pattern.compile("^/topic/trips/([0-9a-f-]{36})$");
    private static final Pattern TYPING = Pattern.compile("^/app/trips/([0-9a-f-]{36})/typing$");
    private static final String MY_QUEUE = "/user/queue/notifications";

    private final JwtDecoder jwt;
    private final ParticipantRepository participants;

    public StompAuthInterceptor(JwtDecoder jwt, ParticipantRepository participants) {
        this.jwt = jwt;
        this.participants = participants;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor acc = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (acc == null || acc.getCommand() == null) return message;
        switch (acc.getCommand()) {
            case CONNECT -> acc.setUser(authenticate(acc.getFirstNativeHeader("Authorization")));
            case SUBSCRIBE -> authorize(acc.getUser(), acc.getDestination(), TRIP_TOPIC, true);
            case SEND -> authorize(acc.getUser(), acc.getDestination(), TYPING, false);
            default -> { }
        }
        return message;
    }

    private Principal authenticate(String header) {
        if (header == null || !header.startsWith("Bearer ")) throw new MessageDeliveryException("Token mancante");
        try {
            return new StompPrincipal(UUID.fromString(jwt.decode(header.substring(7)).getSubject()));
        } catch (JwtException | IllegalArgumentException e) {
            throw new MessageDeliveryException("Token non valido");
        }
    }

    private void authorize(Principal user, String destination, Pattern tripPattern, boolean allowMyQueue) {
        if (!(user instanceof StompPrincipal p) || destination == null) throw new MessageDeliveryException("Non autenticato");
        if (allowMyQueue && destination.equals(MY_QUEUE)) return;
        Matcher m = tripPattern.matcher(destination);
        // il messaggio dell'eccezione arriva al client nel frame ERROR: il FE lo usa per non ritentare (Review Focus 1)
        if (!m.matches()) throw new MessageDeliveryException("Destinazione non permessa: " + destination);
        UUID tripId = UUID.fromString(m.group(1));
        if (participants.findByTripIdAndUserIdAndLeftAtIsNull(tripId, p.userId()).isEmpty()) {
            throw new MessageDeliveryException("Destinazione non permessa: " + destination);
        }
    }
}
