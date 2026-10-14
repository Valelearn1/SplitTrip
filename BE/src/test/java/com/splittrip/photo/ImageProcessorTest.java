package com.splittrip.photo;

import org.junit.jupiter.api.Test;

import javax.imageio.ImageIO;
import java.awt.Color;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ImageProcessorTest {

    static byte[] png(int w, int h, boolean transparent) throws IOException {
        BufferedImage img = new BufferedImage(w, h, transparent ? BufferedImage.TYPE_INT_ARGB : BufferedImage.TYPE_INT_RGB);
        var g = img.createGraphics();
        g.setColor(new Color(200, 30, 30)); g.fillRect(0, 0, w / 2, h);
        g.dispose();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ImageIO.write(img, "png", out);
        return out.toByteArray();
    }

    static byte[] jpeg(int w, int h) throws IOException {
        BufferedImage img = new BufferedImage(w, h, BufferedImage.TYPE_INT_RGB);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ImageIO.write(img, "jpeg", out);
        return out.toByteArray();
    }

    /** Inserisce un segmento APP1 «Exif» finto subito dopo il marker SOI. */
    static byte[] withExif(byte[] jpeg) {
        byte[] app1 = {(byte) 0xFF, (byte) 0xE1, 0x00, 0x10, 'E', 'x', 'i', 'f', 0, 0, 'G', 'P', 'S', 'D', 'A', 'T', 'A', 0};
        byte[] out = new byte[jpeg.length + app1.length];
        System.arraycopy(jpeg, 0, out, 0, 2);
        System.arraycopy(app1, 0, out, 2, app1.length);
        System.arraycopy(jpeg, 2, out, 2 + app1.length, jpeg.length - 2);
        return out;
    }

    static BufferedImage decode(byte[] b) throws IOException { return ImageIO.read(new ByteArrayInputStream(b)); }

    @Test
    void ridimensionaA1600EFaLaMiniaturaA300() throws Exception {
        var p = ImageProcessor.process(jpeg(4000, 3000));
        assertThat(p.width()).isEqualTo(1600);
        assertThat(p.height()).isEqualTo(1200);
        BufferedImage thumb = decode(p.thumbnail());
        assertThat(thumb.getWidth()).isEqualTo(300);
        assertThat(thumb.getHeight()).isEqualTo(225);
        assertThat(p.image()[0] & 0xFF).isEqualTo(0xFF); // JPEG
    }

    @Test
    void immaginiPiccoleNonVengonoIngrandite() throws Exception {
        var p = ImageProcessor.process(jpeg(800, 600));
        assertThat(p.width()).isEqualTo(800);
    }

    @Test
    void iMetadatiExifSpariscono() throws Exception {
        byte[] in = withExif(jpeg(100, 100));
        assertThat(new String(in, StandardCharsets.ISO_8859_1)).contains("GPSDATA");
        var p = ImageProcessor.process(in);
        assertThat(new String(p.image(), StandardCharsets.ISO_8859_1)).doesNotContain("GPSDATA").doesNotContain("Exif");
    }

    @Test
    void pngConTrasparenzaDiventaJpegSuSfondoBianco() throws Exception {
        var p = ImageProcessor.process(png(100, 100, true));
        BufferedImage out = decode(p.image());
        Color corner = new Color(out.getRGB(99, 99)); // zona trasparente
        assertThat(corner.getRed()).isGreaterThan(240);
        assertThat(corner.getGreen()).isGreaterThan(240);
        assertThat(corner.getBlue()).isGreaterThan(240);
    }

    @Test
    void unFileCheNonEUnImmagineVieneRifiutato() {
        assertThatThrownBy(() -> ImageProcessor.process("ciao sono un testo".getBytes(StandardCharsets.UTF_8)))
                .isInstanceOf(InvalidImageException.class);
        byte[] fakeJpeg = {(byte) 0xFF, (byte) 0xD8, 1, 2, 3};
        assertThatThrownBy(() -> ImageProcessor.process(fakeJpeg)).isInstanceOf(InvalidImageException.class);
    }

    @Test
    void avatarQuadrato256ConRitaglioCentrale() throws Exception {
        byte[] a = ImageProcessor.avatar(png(600, 300, false));
        BufferedImage out = decode(a);
        assertThat(out.getWidth()).isEqualTo(256);
        assertThat(out.getHeight()).isEqualTo(256);
    }

    @Test
    void unWebpVieneDecodificatoERiscrittoComeJpeg() throws Exception {
        // WebP lossless 1×1 bianco
        byte[] webp = java.util.Base64.getDecoder().decode("UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==");
        var p = ImageProcessor.process(webp);
        assertThat(p.width()).isEqualTo(1);
        assertThat(p.image()[0] & 0xFF).isEqualTo(0xFF);
        assertThat(p.image()[1] & 0xFF).isEqualTo(0xD8);
    }

    /** PNG valido di 10×10 con le dimensioni dichiarate nell'header (IHDR) cambiate: pochi byte, tanti pixel. */
    static byte[] pngDeclaring(int w, int h) throws IOException {
        byte[] b = png(10, 10, false);
        java.nio.ByteBuffer.wrap(b, 16, 8).putInt(w).putInt(h);
        java.util.zip.CRC32 crc = new java.util.zip.CRC32();
        crc.update(b, 12, 17); // tipo del chunk + 13 byte di dati
        java.nio.ByteBuffer.wrap(b, 29, 4).putInt((int) crc.getValue());
        return b;
    }

    @Test
    void troppiPixelSonoRifiutatiPrimaDiDecodificare() throws IOException {
        byte[] bomb = pngDeclaring(30000, 30000); // pochi KB, ma 900 MP: decodificato saturerebbe la memoria
        assertThatThrownBy(() -> ImageProcessor.process(bomb)).isInstanceOf(InvalidImageException.class).hasMessage("L'immagine è troppo grande");
        assertThatThrownBy(() -> ImageProcessor.avatar(bomb)).isInstanceOf(InvalidImageException.class).hasMessage("L'immagine è troppo grande");
    }

    @Test
    void unaFotoGrandeVieneDecodificataRidottaEProdottaNormalmente() throws IOException {
        ImageProcessor.Processed p = ImageProcessor.process(jpeg(6000, 4000));
        assertThat(p.width()).isEqualTo(1600);
        assertThat(p.height()).isEqualTo(1067);
    }
}
