package com.splittrip.user;

import com.splittrip.auth.CurrentUserId;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
public class AvatarController {

    private final AvatarService service;

    public AvatarController(AvatarService service) { this.service = service; }

    @PutMapping(value = "/api/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Imposta la foto profilo (ritagliata a 256×256)")
    public void set(@CurrentUserId UUID userId, @RequestPart("file") MultipartFile file) {
        service.set(userId, file);
    }

    @DeleteMapping("/api/me/avatar")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Rimuove la foto profilo")
    public void remove(@CurrentUserId UUID userId) {
        service.remove(userId);
    }

    @GetMapping("/api/users/{userId}/avatar")
    @Operation(summary = "Foto profilo di un utente con cui condividi un viaggio")
    public ResponseEntity<byte[]> get(@CurrentUserId UUID viewerId, @PathVariable UUID userId) {
        UserAvatar a = service.get(viewerId, userId);
        // l'ETag cambia quando cambia la foto: il browser non mostra la vecchia
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .cacheControl(CacheControl.noCache().cachePrivate())
                .eTag("\"" + a.getUpdatedAt().toEpochMilli() + "\"")
                .body(a.getImage());
    }
}
