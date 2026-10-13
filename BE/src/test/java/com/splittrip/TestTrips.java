package com.splittrip;

import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public final class TestTrips {

    private TestTrips() {}

    public static UUID create(MockMvc mvc, String token, String name) throws Exception {
        String body = mvc.perform(post("/api/trips").header("Authorization", "Bearer " + token)
                .contentType(APPLICATION_JSON).content("""
                {"name":"%s","destination":"Roma","startDate":"2026-11-01","endDate":"2026-11-05"}
                """.formatted(name)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return UUID.fromString(TestUsers.extract(body, "\"id\":\"([^\"]+)\""));
    }

    public static String inviteCode(MockMvc mvc, String token, UUID tripId) throws Exception {
        String body = mvc.perform(get("/api/trips/" + tripId).header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return TestUsers.extract(body, "\"inviteCode\":\"([^\"]+)\"");
    }

    public static void join(MockMvc mvc, String token, String code) throws Exception {
        mvc.perform(post("/api/trips/join").header("Authorization", "Bearer " + token)
                .contentType(APPLICATION_JSON).content("{\"code\":\"" + code + "\"}"))
                .andExpect(status().isOk());
    }
}
