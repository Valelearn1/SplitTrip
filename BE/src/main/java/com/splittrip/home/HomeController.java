package com.splittrip.home;

import com.splittrip.auth.CurrentUserId;
import com.splittrip.home.dto.HomeResponse;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/me/home")
public class HomeController {

    private final HomeService service;

    public HomeController(HomeService service) { this.service = service; }

    @GetMapping
    @Operation(summary = "La Home in una chiamata: viaggio in evidenza, i miei saldi, ultime novità, elenco viaggi")
    public HomeResponse home(@CurrentUserId UUID userId) { return service.home(userId); }
}
