package com.flamia.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Component
@Slf4j
public class JwtTokenValidator {

    private final SecretKey secretKey;
    private final String issuer;

    public JwtTokenValidator(
            @Value("${flamia.supabase.jwt-secret}") String jwtSecret,
            @Value("${flamia.supabase.url}") String supabaseUrl) {
        this.secretKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        this.issuer = supabaseUrl + "/auth/v1";
    }

    /**
     * Validates a Supabase JWT and returns parsed claims.
     * Throws JwtException variants on validation failure.
     */
    public Claims validateToken(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .requireIssuer(issuer)
                .requireAudience("authenticated")
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Extracts the Supabase user ID (sub claim) from a validated token.
     */
    public String extractSubject(Claims claims) {
        return claims.getSubject();
    }

    /**
     * Extracts the phone number from a validated token.
     */
    public String extractPhone(Claims claims) {
        return claims.get("phone", String.class);
    }
}
