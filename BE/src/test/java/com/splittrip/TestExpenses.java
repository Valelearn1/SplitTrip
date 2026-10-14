package com.splittrip;

import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.UUID;
import java.util.stream.Collectors;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public final class TestExpenses {

    private TestExpenses() {}

    public static String equalBody(String description, String amount, UUID payerId, UUID... participantIds) {
        String shares = Arrays.stream(participantIds).map(id -> "{\"participantId\":\"" + id + "\"}").collect(Collectors.joining(","));
        return """
                {"description":"%s","amount":%s,"date":"2026-11-02","category":"FOOD",
                 "payerId":"%s","splitType":"EQUAL","shares":[%s]}
                """.formatted(description, amount, payerId, shares);
    }

    public static UUID createEqual(MockMvc mvc, String token, UUID tripId, String description, String amount,
                                   UUID payerId, UUID... participantIds) throws Exception {
        String body = mvc.perform(post("/api/trips/" + tripId + "/expenses").header("Authorization", "Bearer " + token)
                .contentType(APPLICATION_JSON).content(equalBody(description, amount, payerId, participantIds)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return UUID.fromString(TestUsers.extract(body, "\"id\":\"([^\"]+)\""));
    }
}
