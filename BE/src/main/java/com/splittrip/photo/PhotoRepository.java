package com.splittrip.photo;

import com.splittrip.photo.dto.PhotoResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

public interface PhotoRepository extends JpaRepository<Photo, UUID> {

    @Query("""
            select new com.splittrip.photo.dto.PhotoResponse(p.id, p.kind, p.expenseId, u.id, u.displayName, p.caption,
                p.takenAt, p.latitude, p.longitude, p.placeName, p.width, p.height, p.createdAt)
            from Photo p join p.uploader u
            where p.trip.id = :tripId and p.kind = :kind and (:onlyLocated = false or p.latitude is not null)
            order by p.createdAt desc
            """)
    List<PhotoResponse> findMeta(UUID tripId, PhotoKind kind, boolean onlyLocated);

    @Query("""
            select new com.splittrip.photo.dto.PhotoResponse(p.id, p.kind, p.expenseId, u.id, u.displayName, p.caption,
                p.takenAt, p.latitude, p.longitude, p.placeName, p.width, p.height, p.createdAt)
            from Photo p join p.uploader u where p.id = :id
            """)
    PhotoResponse findMetaById(UUID id);

    @Query("select p.image from Photo p where p.id = :id and p.trip.id = :tripId")
    Optional<byte[]> findImage(UUID id, UUID tripId);

    @Query("select p.thumbnail from Photo p where p.id = :id and p.trip.id = :tripId")
    Optional<byte[]> findThumbnail(UUID id, UUID tripId);

    @Query("select p.uploader.id from Photo p where p.id = :id and p.trip.id = :tripId")
    Optional<UUID> findUploaderId(UUID id, UUID tripId);

    Optional<Photo> findByIdAndTripId(UUID id, UUID tripId);

    long countByTripIdAndKind(UUID tripId, PhotoKind kind);

    long countByUploaderIdAndKind(UUID uploaderId, PhotoKind kind);

    boolean existsByExpenseIdAndKind(UUID expenseId, PhotoKind kind);

    @Query("select p.expenseId, p.id from Photo p where p.trip.id = :tripId and p.kind = com.splittrip.photo.PhotoKind.RECEIPT")
    List<Object[]> receiptPairs(UUID tripId);

    /** expenseId → id dello scontrino, per tutte le spese del viaggio in una query. */
    default Map<UUID, UUID> findReceiptIdsByTripId(UUID tripId) {
        Map<UUID, UUID> out = new HashMap<>();
        for (Object[] row : receiptPairs(tripId)) out.put((UUID) row[0], (UUID) row[1]);
        return out;
    }
}
