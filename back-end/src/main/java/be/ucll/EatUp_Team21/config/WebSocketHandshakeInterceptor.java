package be.ucll.EatUp_Team21.config;

import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

@Component
public class WebSocketHandshakeInterceptor implements HandshakeInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketHandshakeInterceptor.class);

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler,
            Map<String, Object> attributes) throws Exception {
        try {
            if (request instanceof org.springframework.http.server.ServletServerHttpRequest servletReq) {
                HttpServletRequest httpReq = servletReq.getServletRequest();
                String token = httpReq.getParameter("token");
                if (token == null || token.isBlank()) {
                    // also accept Authorization header
                    token = httpReq.getHeader("Authorization");
                }
                if (token != null && !token.isBlank()) {
                    attributes.put("token", token);
                    logger.info("Stored websocket handshake token attr length={}", token.length());
                }
            }
        } catch (Exception e) {
            logger.debug("Handshake interceptor error", e);
        }
        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler,
            Exception exception) {
        // no-op
    }
}
