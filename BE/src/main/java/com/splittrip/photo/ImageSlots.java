package com.splittrip.photo;

import com.splittrip.common.AppException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.concurrent.Semaphore;
import java.util.function.Function;

/** Al massimo due immagini in elaborazione alla volta in tutta l'app (foto, scontrini, avatar): l'istanza free ha 256 MB di heap. */
@Component
public class ImageSlots {

    private final Semaphore slots = new Semaphore(2);

    public <T> T process(MultipartFile file, Function<byte[], T> work) {
        try {
            slots.acquire();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new AppException(HttpStatus.SERVICE_UNAVAILABLE, "Server occupato", "Riprova tra qualche secondo");
        }
        try {
            return work.apply(file.getBytes());
        } catch (IOException e) {
            throw new InvalidImageException();
        } finally {
            slots.release();
        }
    }
}
