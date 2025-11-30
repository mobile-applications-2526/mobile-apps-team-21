package be.ucll.EatUp_Team21.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import be.ucll.EatUp_Team21.security.JwtUtil;
import be.ucll.EatUp_Team21.security.CustomUserDetailsService;

@Component
public class WebSocketAuthChannelInterceptor implements ChannelInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketAuthChannelInterceptor.class);

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    @Autowired
    public WebSocketAuthChannelInterceptor(JwtUtil jwtUtil, CustomUserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            List<String> auth = accessor.getNativeHeader("Authorization");
            if ((auth == null || auth.isEmpty())) {
                auth = accessor.getNativeHeader("authorization");
            }
            // log headers and session attributes to diagnose why auth is null
            logger.info("WS CONNECT: sessionId={} firstAuthHeader={}", accessor.getSessionId(), accessor.getFirstNativeHeader("Authorization"));
            if (auth != null && !auth.isEmpty()) {
                String bearer = auth.get(0);
                if (bearer != null && bearer.startsWith("Bearer ")) {
                    String token = bearer.substring(7);
                    try {
                        if (jwtUtil.validateToken(token)) {
                            String username = jwtUtil.getUsernameFromToken(token);
                                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                                // use the username string as the principal so Principal.getName() returns the username
                                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                    username, null, userDetails.getAuthorities());
                                accessor.setUser(authToken);
                                logger.info("Set principal from CONNECT header for {} (session={})", username, accessor.getSessionId());
                        }
                    } catch (Exception e) {
                        logger.info("WebSocket CONNECT auth failed from header", e);
                    }
                }
            } else {
                // fallback: check for token stored by the HTTP handshake interceptor (session attributes)
                try {
                    var sessionAttrs = accessor.getSessionAttributes();
                    if (sessionAttrs != null) {
                        logger.info("Session attributes present for session {}: {}", accessor.getSessionId(), sessionAttrs.keySet());
                        Object t = sessionAttrs.get("token");
                        if (t != null) {
                            String tokenStr = t.toString();
                            if (tokenStr.startsWith("Bearer ")) {
                                tokenStr = tokenStr.substring(7);
                            }
                            if (jwtUtil.validateToken(tokenStr)) {
                                String username = jwtUtil.getUsernameFromToken(tokenStr);
                                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(username, null, userDetails.getAuthorities());
                                accessor.setUser(authToken);
                                logger.info("Set user principal from handshake token for {} (session={})", username, accessor.getSessionId());
                            }
                        } else {
                            logger.info("No token attribute found in session {}", accessor.getSessionId());
                        }
                    } else {
                        logger.info("No session attributes available for session {}", accessor.getSessionId());
                    }
                } catch (Exception e) {
                    logger.info("Error processing handshake token", e);
                }
            }
        }
        return message;
    }
}
