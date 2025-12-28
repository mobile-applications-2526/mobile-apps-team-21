package be.ucll.EatUp_Team21.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import jakarta.annotation.PostConstruct;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final WebSocketAuthChannelInterceptor authInterceptor;
    private final WebSocketHandshakeInterceptor handshakeInterceptor;
    private final UserHandshakeHandler userHandshakeHandler;

    public WebSocketConfig(WebSocketAuthChannelInterceptor authInterceptor,
                           WebSocketHandshakeInterceptor handshakeInterceptor,
                           UserHandshakeHandler userHandshakeHandler) {
        this.authInterceptor = authInterceptor;
        this.handshakeInterceptor = handshakeInterceptor;
        this.userHandshakeHandler = userHandshakeHandler;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // messages to clients will be sent to destinations prefixed with /topic
        config.enableSimpleBroker("/topic", "/queue");
        // messages from clients should have destination starting with /app
        config.setApplicationDestinationPrefixes("/app");
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // STOMP endpoint with SockJS fallback (for web browsers)
        registry.addEndpoint("/ws")
            .setAllowedOriginPatterns("*")
            .setHandshakeHandler(userHandshakeHandler)
            .addInterceptors(handshakeInterceptor)
            .withSockJS();

        // Native WebSocket endpoint (for React Native and modern clients)
        registry.addEndpoint("/ws")
            .setAllowedOriginPatterns("*")
            .setHandshakeHandler(userHandshakeHandler)
            .addInterceptors(handshakeInterceptor);
    }

    @PostConstruct
    public void configureWebSocketSessionTimeout() {
        // Set the default WebSocket session idle timeout to 2 minutes (120000 ms)
        // This is a global JVM property for Tomcat/Undertow/Jetty
        System.setProperty("org.apache.tomcat.websocket.DEFAULT_TIMEOUT", "120000");
        System.setProperty("io.undertow.websockets.session-async-send-timeout", "120000");
        System.setProperty("org.eclipse.jetty.websocket.idleTimeout", "120000");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        // register auth interceptor to extract JWT from CONNECT
        registration.interceptors(authInterceptor);
    }
}
