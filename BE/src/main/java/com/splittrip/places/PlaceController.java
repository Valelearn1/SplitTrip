package com.splittrip.places;

import com.splittrip.auth.CurrentUserId;
import com.splittrip.places.dto.Place;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/places")
public class PlaceController {

    private final PlaceService service;

    public PlaceController(PlaceService service) { this.service = service; }

    @GetMapping
    @Operation(summary = "Proposte di luoghi (città, vie, monumenti) per un testo; near=lat,lon dà priorità ai luoghi vicini")
    public List<Place> search(@CurrentUserId UUID userId, @RequestParam String q, @RequestParam(required = false) String near) {
        return service.search(userId, q, near);
    }
}
