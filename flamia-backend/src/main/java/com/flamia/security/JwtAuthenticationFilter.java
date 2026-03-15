package com.flamia.security;

import com.flamia.entity.User;
import com.flamia.repository.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenValidator jwtTokenValidator;
    private final UserRepository userRepository;

    private static final String AUTH_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    // Endpoints that do NOT require authentication
    private static final List<String> PUBLIC_PATHS = List.of(
            "/api/products/**",
            "/api/categories/**",
            "/api/reviews/product/**"
    );

    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // Skip JWT validation for public endpoints
        String requestPath = request.getRequestURI();
        if (isPublicPath(requestPath)) {
            // Still try to extract auth for optional "isOwn" flags on reviews
            tryOptionalAuth(request);
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader(AUTH_HEADER);

        if (!StringUtils.hasText(authHeader) || !authHeader.startsWith(BEARER_PREFIX)) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(BEARER_PREFIX.length());

        try {
            Claims claims = jwtTokenValidator.validateToken(token);
            String supabaseId = jwtTokenValidator.extractSubject(claims);

            User user = userRepository.findBySupabaseId(supabaseId).orElse(null);

            if (user != null) {
                UserPrincipal principal = new UserPrincipal(user);
                SecurityContextHolder.getContext().setAuthentication(principal);
            }
        } catch (JwtException ex) {
            log.warn("JWT validation failed: {}", ex.getMessage());
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }

    private boolean isPublicPath(String path) {
        return PUBLIC_PATHS.stream().anyMatch(pattern -> pathMatcher.match(pattern, path));
    }

    /**
     * Attempts to extract authentication from token on public endpoints.
     * Used so review responses can include "isOwn" flag for the current user.
     * Failures are silently ignored (endpoint remains accessible).
     */
    private void tryOptionalAuth(HttpServletRequest request) {
        try {
            String authHeader = request.getHeader(AUTH_HEADER);
            if (StringUtils.hasText(authHeader) && authHeader.startsWith(BEARER_PREFIX)) {
                String token = authHeader.substring(BEARER_PREFIX.length());
                Claims claims = jwtTokenValidator.validateToken(token);
                String supabaseId = jwtTokenValidator.extractSubject(claims);
                userRepository.findBySupabaseId(supabaseId)
                        .ifPresent(user -> SecurityContextHolder.getContext()
                                .setAuthentication(new UserPrincipal(user)));
            }
        } catch (Exception ignored) {
            // Public endpoint — auth is optional
        }
    }
}
