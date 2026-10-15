package com.splittrip.live;

import org.springframework.messaging.converter.StringMessageConverter;
import org.springframework.messaging.simp.stomp.StompFrameHandler;
import org.springframework.messaging.simp.stomp.StompHeaders;
import org.springframework.messaging.simp.stomp.StompSession;
import org.springframework.messaging.simp.stomp.StompSessionHandlerAdapter;
import org.springframework.web.socket.WebSocketHttpHeaders;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;

import java.lang.reflect.Type;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

/** Client STOMP vero per i test: i payload arrivano come stringhe JSON in una coda. */
public final class LiveTestClient {

    private final StompSession session;

    private LiveTestClient(StompSession session) { this.session = session; }

    public static LiveTestClient connect(int port, String token) throws Exception {
        WebSocketStompClient stomp = new WebSocketStompClient(new StandardWebSocketClient());
        // il server manda application/json: il convertitore deve accettarlo, altrimenti il frame si scarta in silenzio
        stomp.setMessageConverter(new StringMessageConverter() {{ addSupportedMimeTypes(org.springframework.util.MimeTypeUtils.APPLICATION_JSON); }});
        StompHeaders connect = new StompHeaders();
        if (token != null) connect.add("Authorization", "Bearer " + token);
        WebSocketHttpHeaders http = new WebSocketHttpHeaders();
        http.setOrigin("http://localhost:5173");
        StompSession s = stomp.connectAsync("ws://localhost:" + port + "/ws", http, connect, new StompSessionHandlerAdapter() {
                    @Override public void handleException(StompSession s, org.springframework.messaging.simp.stomp.StompCommand c, StompHeaders h, byte[] p, Throwable e) {
                        System.err.println("STOMP test client: " + e);
                    }
                })
                .get(5, TimeUnit.SECONDS);
        return new LiveTestClient(s);
    }

    public BlockingQueue<String> subscribe(String destination) {
        BlockingQueue<String> queue = new LinkedBlockingQueue<>();
        session.subscribe(destination, new StompFrameHandler() {
            @Override public Type getPayloadType(StompHeaders headers) { return String.class; }
            @Override public void handleFrame(StompHeaders headers, Object payload) { queue.add((String) payload); }
        });
        return queue;
    }

    public void send(String destination) { session.send(destination, ""); }

    public boolean isConnected() { return session.isConnected(); }

    public void disconnect() { if (session.isConnected()) session.disconnect(); }
}
