package com.splittrip.common;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

/** Converte DATABASE_URL (formato postgresql://user:pass@host:port/db di Render) nelle proprietà Spring. */
public class DatabaseUrlEnvironmentPostProcessor implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment env, SpringApplication app) {
        String url = env.getProperty("DATABASE_URL");
        if (url == null || url.startsWith("jdbc:")) {
            if (url != null) {
                env.getPropertySources().addFirst(new MapPropertySource("databaseUrl", Map.of("JDBC_DATABASE_URL", url)));
            }
            return;
        }
        URI uri = URI.create(url);
        String[] userInfo = uri.getUserInfo() == null ? new String[0] : uri.getUserInfo().split(":", 2);
        int port = uri.getPort() == -1 ? 5432 : uri.getPort();
        Map<String, Object> props = new HashMap<>();
        props.put("JDBC_DATABASE_URL", "jdbc:postgresql://" + uri.getHost() + ":" + port + uri.getPath());
        if (userInfo.length == 2) {
            props.put("spring.datasource.username", userInfo[0]);
            props.put("spring.datasource.password", userInfo[1]);
        }
        env.getPropertySources().addFirst(new MapPropertySource("databaseUrl", props));
    }
}
