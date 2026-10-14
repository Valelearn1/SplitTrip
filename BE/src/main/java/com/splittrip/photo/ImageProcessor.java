package com.splittrip.photo;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageReadParam;
import javax.imageio.ImageReader;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageInputStream;
import javax.imageio.stream.MemoryCacheImageOutputStream;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Iterator;

/** Ridecodifica, ridimensiona e riscrive come JPEG senza metadati: nel DB entra solo ciò che produce il server (D-35). */
public final class ImageProcessor {

    public static final int MAX_SIDE = 1600;
    public static final int THUMB_SIDE = 300;
    public static final int AVATAR_SIDE = 256;
    private static final float QUALITY = 0.85f;
    /** Oltre questa soglia l'immagine si rifiuta prima di decodificarla: pochi MB di PNG possono dichiarare miliardi di pixel. */
    static final long MAX_PIXELS = 50_000_000L;
    /** Le immagini grandi si decodificano già ridotte (un pixel ogni n) fino a questo lato: memoria limitata anche con foto da 48 MP. */
    private static final int DECODE_SIDE = 2 * MAX_SIDE;

    public record Processed(byte[] image, byte[] thumbnail, int width, int height) {}

    private ImageProcessor() {}

    public static Processed process(byte[] input) {
        BufferedImage src = decode(input);
        BufferedImage main = fit(src, MAX_SIDE);
        BufferedImage thumb = fit(src, THUMB_SIDE);
        return new Processed(jpeg(main), jpeg(thumb), main.getWidth(), main.getHeight());
    }

    public static byte[] avatar(byte[] input) {
        BufferedImage src = decode(input);
        int side = Math.min(src.getWidth(), src.getHeight());
        BufferedImage square = src.getSubimage((src.getWidth() - side) / 2, (src.getHeight() - side) / 2, side, side);
        return jpeg(scale(square, AVATAR_SIDE, AVATAR_SIDE));
    }

    private static BufferedImage decode(byte[] input) {
        if (!looksLikeImage(input)) throw new InvalidImageException();
        try (ImageInputStream in = ImageIO.createImageInputStream(new ByteArrayInputStream(input))) {
            Iterator<ImageReader> readers = ImageIO.getImageReaders(in);
            if (!readers.hasNext()) throw new InvalidImageException();
            ImageReader reader = readers.next();
            try {
                reader.setInput(in, true, true);
                int w = reader.getWidth(0), h = reader.getHeight(0); // letti dall'header, senza decodificare
                if ((long) w * h > MAX_PIXELS) throw new InvalidImageException("L'immagine è troppo grande");
                int step = (Math.max(w, h) + DECODE_SIDE - 1) / DECODE_SIDE;
                ImageReadParam param = reader.getDefaultReadParam();
                param.setSourceSubsampling(step, step, 0, 0);
                BufferedImage img = reader.read(0, param);
                if (img == null) throw new InvalidImageException();
                return img;
            } finally {
                reader.dispose();
            }
        } catch (IOException e) {
            throw new InvalidImageException();
        }
    }

    /** Tipo dai primi byte: estensione e Content-Type dichiarato non contano. */
    static boolean looksLikeImage(byte[] b) {
        if (b.length < 12) return false;
        boolean jpeg = (b[0] & 0xFF) == 0xFF && (b[1] & 0xFF) == 0xD8;
        boolean png = (b[0] & 0xFF) == 0x89 && b[1] == 'P' && b[2] == 'N' && b[3] == 'G';
        boolean webp = b[0] == 'R' && b[1] == 'I' && b[2] == 'F' && b[3] == 'F' && b[8] == 'W' && b[9] == 'E' && b[10] == 'B' && b[11] == 'P';
        return jpeg || png || webp;
    }

    private static BufferedImage fit(BufferedImage src, int maxSide) {
        int w = src.getWidth(), h = src.getHeight();
        int longSide = Math.max(w, h);
        if (longSide <= maxSide) return scale(src, w, h);
        double k = (double) maxSide / longSide;
        return scale(src, Math.max(1, (int) Math.round(w * k)), Math.max(1, (int) Math.round(h * k)));
    }

    /** Disegna su un'immagine RGB nuova: niente alfa (sfondo bianco), niente metadati. */
    private static BufferedImage scale(BufferedImage src, int w, int h) {
        BufferedImage out = new BufferedImage(w, h, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = out.createGraphics();
        g.setColor(Color.WHITE);
        g.fillRect(0, 0, w, h);
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g.drawImage(src, 0, 0, w, h, null);
        g.dispose();
        return out;
    }

    private static byte[] jpeg(BufferedImage img) {
        ImageWriter writer = ImageIO.getImageWritersByFormatName("jpeg").next();
        ImageWriteParam param = writer.getDefaultWriteParam();
        param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
        param.setCompressionQuality(QUALITY);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (MemoryCacheImageOutputStream ios = new MemoryCacheImageOutputStream(out)) {
            writer.setOutput(ios);
            writer.write(null, new IIOImage(img, null, null), param);
        } catch (IOException e) {
            throw new IllegalStateException("Impossibile scrivere il JPEG", e);
        } finally {
            writer.dispose();
        }
        return out.toByteArray();
    }
}
