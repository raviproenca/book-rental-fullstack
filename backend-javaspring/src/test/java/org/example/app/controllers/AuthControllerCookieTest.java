package org.example.app.controllers;

import org.example.app.models.requests.AuthRequestDTO;
import org.example.app.models.responses.AuthResponseDTO;
import org.example.app.services.UserService;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

public class AuthControllerCookieTest {

    @InjectMocks
    private AuthController authController;

    @Mock
    private UserService userService;

    @Test
    public void testLoginSetsCookie() throws Exception {
        try (AutoCloseable mocks = MockitoAnnotations.openMocks(this)) {
            AuthRequestDTO request = new AuthRequestDTO("test@example.com", "password123");
            AuthResponseDTO responseDTO = new AuthResponseDTO("Test User", "USER", "test@example.com", "dummy-jwt-token");

            when(userService.loginService(any(AuthRequestDTO.class))).thenReturn(responseDTO);

            ResponseEntity<AuthResponseDTO> response = authController.loginController(request);

            String setCookieHeader = response.getHeaders().getFirst(org.springframework.http.HttpHeaders.SET_COOKIE);
            
            assertTrue(setCookieHeader != null, "Set-Cookie header should not be null");
            assertTrue(setCookieHeader.contains("token=dummy-jwt-token"), "Cookie should contain token");
            assertTrue(setCookieHeader.contains("HttpOnly"), "Cookie should be HttpOnly");
            assertTrue(setCookieHeader.contains("Secure"), "Cookie should be Secure");
            assertTrue(setCookieHeader.contains("SameSite=None"), "Cookie should have SameSite=None");
        }
    }
}
