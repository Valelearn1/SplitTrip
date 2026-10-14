package com.splittrip.photo;

import com.splittrip.auth.CurrentUserId;
import com.splittrip.photo.dto.PhotoResponse;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/trips/{tripId}/photos")
public class PhotoController {

    private final PhotoService service;

    public PhotoController(PhotoService service) { this.service = service; }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Carica una foto (o lo scontrino di una spesa con expenseId); la posizione solo con consenso")
    public PhotoResponse upload(@CurrentUserId UUID userId, @PathVariable UUID tripId,
                                @RequestPart("file") MultipartFile file,
                                @RequestParam(required = false) String caption,
                                @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant takenAt,
                                @RequestParam(required = false) BigDecimal latitude,
                                @RequestParam(required = false) BigDecimal longitude,
                                @RequestParam(required = false) UUID expenseId) {
        return service.upload(tripId, userId, file, caption, takenAt, latitude, longitude, expenseId);
    }

    @GetMapping
    @Operation(summary = "Metadati delle foto, dalla più recente; withLocation=true per la mappa")
    public List<PhotoResponse> list(@CurrentUserId UUID userId, @PathVariable UUID tripId,
                                    @RequestParam(defaultValue = "PHOTO") PhotoKind kind,
                                    @RequestParam(defaultValue = "false") boolean withLocation) {
        return service.list(tripId, userId, kind, withLocation);
    }

    @GetMapping("/{photoId}/image")
    @Operation(summary = "Immagine (JPEG, lato lungo fino a 1600 px)")
    public ResponseEntity<byte[]> image(@CurrentUserId UUID userId, @PathVariable UUID tripId, @PathVariable UUID photoId) {
        return jpeg(photoId, service.image(tripId, userId, photoId));
    }

    @GetMapping("/{photoId}/thumbnail")
    @Operation(summary = "Miniatura (JPEG, 300 px)")
    public ResponseEntity<byte[]> thumbnail(@CurrentUserId UUID userId, @PathVariable UUID tripId, @PathVariable UUID photoId) {
        return jpeg(photoId, service.thumbnail(tripId, userId, photoId));
    }

    @DeleteMapping("/{photoId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Elimina una foto (autore o organizzatore)")
    public void delete(@CurrentUserId UUID userId, @PathVariable UUID tripId, @PathVariable UUID photoId) {
        service.delete(tripId, userId, photoId);
    }

    /** Le foto non cambiano mai: cache privata di un anno, l'id fa da ETag. */
    static ResponseEntity<byte[]> jpeg(UUID id, byte[] bytes) {
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .cacheControl(CacheControl.maxAge(365, TimeUnit.DAYS).cachePrivate().immutable())
                .eTag("\"" + id + "\"")
                .body(bytes);
    }
}
