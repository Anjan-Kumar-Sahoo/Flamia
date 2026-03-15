package com.flamia.util;

import java.text.Normalizer;
import java.util.Locale;

public class SlugGenerator {

    private SlugGenerator() {}

    /**
     * Generates a URL-friendly slug from the given string.
     * Example: "Vanilla Dream Candle" → "vanilla-dream-candle"
     */
    public static String generateSlug(String input) {
        if (input == null || input.isBlank()) {
            throw new IllegalArgumentException("Input for slug generation cannot be null or blank");
        }

        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        String withoutDiacritics = normalized.replaceAll("\\p{M}", "");

        return withoutDiacritics
                .toLowerCase(Locale.ENGLISH)
                .replaceAll("[^a-z0-9\\s-]", "")   // Remove special chars
                .replaceAll("\\s+", "-")             // Spaces to hyphens
                .replaceAll("-{2,}", "-")             // Collapse multiple hyphens
                .replaceAll("^-|-$", "");             // Trim leading/trailing hyphens
    }

    /**
     * Generates a unique slug by appending a suffix if the base slug already exists.
     */
    public static String makeUnique(String baseSlug, java.util.function.Predicate<String> existsChecker) {
        if (!existsChecker.test(baseSlug)) {
            return baseSlug;
        }

        int counter = 2;
        String candidateSlug;
        do {
            candidateSlug = baseSlug + "-" + counter;
            counter++;
        } while (existsChecker.test(candidateSlug));

        return candidateSlug;
    }
}
