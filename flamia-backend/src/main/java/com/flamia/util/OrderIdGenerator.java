package com.flamia.util;

import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Generates order numbers in the format FLM-YYYYMMDD-XXXX.
 * Thread-safe counter resets daily.
 */
@Component
public class OrderIdGenerator {

    private static final String PREFIX = "FLM";
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd");

    private final ConcurrentHashMap<String, AtomicInteger> dailyCounters = new ConcurrentHashMap<>();

    public String generateOrderId() {
        String dateStr = LocalDate.now().format(DATE_FORMAT);

        AtomicInteger counter = dailyCounters.computeIfAbsent(dateStr, k -> {
            // Clean up old entries
            dailyCounters.keySet().removeIf(key -> !key.equals(dateStr));
            return new AtomicInteger(0);
        });

        int orderNum = counter.incrementAndGet();

        return String.format("%s-%s-%04d", PREFIX, dateStr, orderNum);
    }
}
