package be.ucll.EatUp_Team21.config;

import java.security.Principal;
import java.util.Collections;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import be.ucll.EatUp_Team21.security.JwtUtil;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

/**
 * Handshake handler that returns a Principal based on a JWT token put into the handshake attributes.
 * This ensures the broker has a Principal associated with the websocket session so user destinations work.
 */
@Component
public class UserHandshakeHandler extends DefaultHandshakeHandler {

    private static final Logger log = LoggerFactory.getLogger(UserHandshakeHandler.class);

    private final JwtUtil jwtUtil;

    public UserHandshakeHandler(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected @Nullable Principal determineUser(ServerHttpRequest request, WebSocketHandler wsHandler, Map<String, Object> attributes) {
        try {
            Object tokenObj = attributes.get("token");
            if (tokenObj instanceof String) {
                String token = (String) tokenObj;
                // token may have been stored with or without leading Bearer
                if (token.startsWith("Bearer ")) {
                    token = token.substring(7);
                }
                if (jwtUtil.validateToken(token)) {
                    String username = jwtUtil.getUsernameFromToken(token);
                    if (username != null && !username.isEmpty()) {
                        log.info("Handshake: determined principal username='{}' from token", username);
                        // Return an Authentication object which also implements Principal
                        return new UsernamePasswordAuthenticationToken(username, null, Collections.emptyList());
                    }
                }
            }
        } catch (Exception ex) {
            log.debug("Handshake principal extraction failed: {}", ex.toString());
        }
        // fallback to default behavior
        return super.determineUser(request, wsHandler, attributes);
    }
}
