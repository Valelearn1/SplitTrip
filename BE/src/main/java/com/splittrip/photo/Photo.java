package com.splittrip.photo;

import com.splittrip.trip.Trip;
import com.splittrip.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "photos")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Photo {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "trip_id") private Trip trip;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "uploader_id") private User uploader;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 8) private PhotoKind kind;
    /** Solo per gli scontrini. Semplice id: un'associazione verso Expense (@SoftDelete) dovrebbe essere EAGER. */
    @Column(name = "expense_id") private UUID expenseId;
    @Column(nullable = false) private byte[] image;
    @Column(nullable = false) private byte[] thumbnail;
    @Column(nullable = false) private int width;
    @Column(nullable = false) private int height;
    @Column(length = 200) private String caption;
    @Setter @Column(name = "place_name", length = 120) private String placeName;
    @Column(name = "taken_at") private Instant takenAt;
    @Setter @Column(precision = 9, scale = 6) private BigDecimal latitude;
    @Setter @Column(precision = 9, scale = 6) private BigDecimal longitude;
    @Column(name = "created_at", nullable = false) private Instant createdAt;

    public Photo(Trip trip, User uploader, PhotoKind kind, UUID expenseId, ImageProcessor.Processed img,
                 String caption, Instant takenAt, BigDecimal latitude, BigDecimal longitude, String placeName, Instant now) {
        this.trip = trip;
        this.uploader = uploader;
        this.kind = kind;
        this.expenseId = expenseId;
        this.image = img.image();
        this.thumbnail = img.thumbnail();
        this.width = img.width();
        this.height = img.height();
        this.caption = caption;
        this.takenAt = takenAt;
        this.latitude = latitude;
        this.longitude = longitude;
        this.placeName = placeName;
        this.createdAt = now;
    }
}
