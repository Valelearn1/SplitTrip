package com.splittrip;

import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public final class TestUsers {

    private TestUsers() {}

    /** Registra un utente con email univoca e restituisce il token. */
    public static String register(MockMvc mvc, String displayName) throws Exception {
        String email = displayName.toLowerCase() + "-" + UUID.randomUUID() + "@example.com";
        MvcResult res = mvc.perform(post("/api/auth/register").contentType(APPLICATION_JSON).content("""
                {"email":"%s","password":"password1","displayName":"%s","acceptedTerms":true}
                """.formatted(email, displayName)))
                .andExpect(status().isCreated())
                .andReturn();
        return extract(res.getResponse().getContentAsString(), "\"token\":\"([^\"]+)\"");
    }

    public static UUID idOf(MockMvc mvc, String token) throws Exception {
        MvcResult res = mvc.perform(get("/api/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn();
        return UUID.fromString(extract(res.getResponse().getContentAsString(), "\"id\":\"([^\"]+)\""));
    }

    public static String extract(String json, String regex) {
        Matcher m = Pattern.compile(regex).matcher(json);
        if (!m.find()) throw new AssertionError("Pattern non trovato: " + regex + " in " + json);
        return m.group(1);
    }
}
