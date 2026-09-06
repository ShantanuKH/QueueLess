package com.queueless.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey signingKey;
    private final long accessTokenExpiration;
    private final long refreshTokenExpiration;

    private static final String TOKEN_TYPE_CLAIM = "tokenType";
    private static final String ACCESS_TOKEN = "ACCESS";
    private static final String REFRESH_TOKEN = "REFRESH";

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-token-expiration}") long accessTokenExpiration,
            @Value("${jwt.refresh-token-expiration}") long refreshTokenExpiration
    ) {
        this.signingKey = Keys.hmacShaKeyFor(
                Decoders.BASE64.decode(secret)
        );

        this.accessTokenExpiration = accessTokenExpiration;
        this.refreshTokenExpiration = refreshTokenExpiration;
    }

    public String generateAccessToken(String email) {

        Date now = new Date();

        return Jwts.builder()
                .subject(email)
                .claim(TOKEN_TYPE_CLAIM, ACCESS_TOKEN)
                .issuedAt(now)
                .expiration(
                        new Date(now.getTime() + accessTokenExpiration)
                )
                .signWith(signingKey)
                .compact();
    }

    public String generateRefreshToken(String email) {

        Date now = new Date();

        return Jwts.builder()
                .subject(email)
                .claim(TOKEN_TYPE_CLAIM, REFRESH_TOKEN)
                .issuedAt(now)
                .expiration(
                        new Date(now.getTime() + refreshTokenExpiration)
                )
                .signWith(signingKey)
                .compact();
    }

    public boolean isRefreshToken(String token) {

        try {
            Claims claims = extractAllClaims(token);

            return REFRESH_TOKEN.equals(
                    claims.get(TOKEN_TYPE_CLAIM, String.class)
            );

        } catch (Exception exception) {
            return false;
        }
    }

    public boolean isAccessToken(String token) {

        try {
            Claims claims = extractAllClaims(token);

            return ACCESS_TOKEN.equals(
                    claims.get(TOKEN_TYPE_CLAIM, String.class)
            );

        } catch (Exception exception) {
            return false;
        }
    }

    public String extractEmail(String token) {

        return extractAllClaims(token).getSubject();
    }

    public boolean isTokenValid(String token) {

        try {
            extractAllClaims(token);
            return true;
        } catch (Exception exception) {
            return false;
        }
    }

    private Claims extractAllClaims(String token) {

        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }


}