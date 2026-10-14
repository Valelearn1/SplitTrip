package com.splittrip.photo;

import com.splittrip.common.BadRequestException;

/** Il file caricato non è un'immagine JPEG, PNG o WebP decodificabile. */
public class InvalidImageException extends BadRequestException {
    public InvalidImageException() { super("Il file non è un'immagine"); }
    public InvalidImageException(String detail) { super(detail); }
}
