package org.example.app.config.security;

public class JwtAuthenticationFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
}
