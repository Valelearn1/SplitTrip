package com.splittrip.photo;

import com.splittrip.common.AppException;
import com.splittrip.common.BadRequestException;
import com.splittrip.common.ConflictException;
import com.splittrip.common.FieldException;
import com.splittrip.common.ForbiddenException;
import com.splittrip.common.NotFoundException;
import com.splittrip.common.PayloadTooLargeException;
import com.splittrip.expense.ExpenseRepository;
import com.splittrip.photo.dto.PhotoResponse;
import com.splittrip.trip.Participant;
import com.splittrip.trip.Trip;
import com.splittrip.trip.TripAccessService;
import com.splittrip.trip.TripRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.Semaphore;

/**
 * Foto e scontrini (D-35). L'elaborazione dell'immagine avviene fuori transazione e al massimo due alla volta:
 * l'istanza free ha 256 MB di heap.
 */
@Service
public class PhotoService {

    static final long MAX_BYTES = 3L * 1024 * 1024;

    private final PhotoRepository photos;
    private final TripRepository trips;
    private final ExpenseRepository expenses;
    private final TripAccessService access;
    private final Clock clock;
    private final int maxPerTrip;
    private final Semaphore slots = new Semaphore(2);

    public PhotoService(PhotoRepository photos, TripRepository trips, ExpenseRepository expenses, TripAccessService access,
                        Clock clock, @Value("${app.photos.max-per-trip:200}") int maxPerTrip) {
        this.photos = photos;
        this.trips = trips;
        this.expenses = expenses;
        this.access = access;
        this.clock = clock;
        this.maxPerTrip = maxPerTrip;
    }

    public PhotoResponse upload(UUID tripId, UUID userId, MultipartFile file, String caption, Instant takenAt,
                                BigDecimal latitude, BigDecimal longitude, UUID expenseId) {
        Participant me = access.requireMember(tripId, userId);
        Trip trip = trips.findById(tripId).orElseThrow();
        access.requireWritable(trip);
        if (file == null || file.isEmpty()) throw new FieldException("file", "Scegli una foto");
        if (file.getSize() > MAX_BYTES) throw new PayloadTooLargeException();
        validateLocation(latitude, longitude);

        PhotoKind kind = expenseId == null ? PhotoKind.PHOTO : PhotoKind.RECEIPT;
        if (kind == PhotoKind.RECEIPT) {
            expenses.findByIdAndTripId(expenseId, tripId).orElseThrow(() -> new BadRequestException("La spesa deve far parte del viaggio"));
            if (photos.existsByExpenseIdAndKind(expenseId, PhotoKind.RECEIPT)) throw new ConflictException("Questa spesa ha già uno scontrino");
        } else if (photos.countByTripIdAndKind(tripId, PhotoKind.PHOTO) >= maxPerTrip) {
            throw new ConflictException("Questo viaggio ha raggiunto il limite di " + maxPerTrip + " foto");
        }

        ImageProcessor.Processed img = process(file);
        String cleanCaption = caption == null || caption.isBlank() ? null : caption.strip();
        if (cleanCaption != null && cleanCaption.length() > 200) throw new FieldException("caption", "Al massimo 200 caratteri");
        Photo saved = photos.save(new Photo(trip, me.getUser(), kind, expenseId, img, cleanCaption, takenAt,
                latitude, longitude, clock.instant()));
        return photos.findMetaById(saved.getId());
    }

    @Transactional(readOnly = true)
    public List<PhotoResponse> list(UUID tripId, UUID userId, PhotoKind kind, boolean onlyLocated) {
        access.requireMember(tripId, userId);
        return photos.findMeta(tripId, kind, onlyLocated);
    }

    @Transactional(readOnly = true)
    public byte[] image(UUID tripId, UUID userId, UUID photoId) {
        access.requireMember(tripId, userId);
        return photos.findImage(photoId, tripId).orElseThrow(() -> new NotFoundException("Foto non trovata"));
    }

    @Transactional(readOnly = true)
    public byte[] thumbnail(UUID tripId, UUID userId, UUID photoId) {
        access.requireMember(tripId, userId);
        return photos.findThumbnail(photoId, tripId).orElseThrow(() -> new NotFoundException("Foto non trovata"));
    }

    @Transactional
    public void delete(UUID tripId, UUID userId, UUID photoId) {
        Participant me = access.requireMember(tripId, userId);
        UUID uploader = photos.findUploaderId(photoId, tripId).orElseThrow(() -> new NotFoundException("Foto non trovata"));
        if (!uploader.equals(userId) && !me.isOrganizer()) {
            throw new ForbiddenException("Solo chi l'ha caricata o l'organizzatore può eliminarla");
        }
        photos.deleteById(photoId);
    }

    private ImageProcessor.Processed process(MultipartFile file) {
        try {
            slots.acquire();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new AppException(HttpStatus.SERVICE_UNAVAILABLE, "Server occupato", "Riprova tra qualche secondo");
        }
        try {
            return ImageProcessor.process(file.getBytes());
        } catch (IOException e) {
            throw new InvalidImageException();
        } finally {
            slots.release();
        }
    }

    /** Posizione solo con consenso: o entrambe le coordinate o nessuna, nei limiti geografici (D-35). */
    private static void validateLocation(BigDecimal lat, BigDecimal lon) {
        if ((lat == null) != (lon == null)) {
            throw new FieldException(lat == null ? "latitude" : "longitude", "Servono entrambe le coordinate");
        }
        if (lat == null) return;
        if (lat.abs().compareTo(BigDecimal.valueOf(90)) > 0) throw new FieldException("latitude", "Latitudine non valida");
        if (lon.abs().compareTo(BigDecimal.valueOf(180)) > 0) throw new FieldException("longitude", "Longitudine non valida");
    }
}
