package be.ucll.EatUp_Team21.security;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

import java.util.List;

@ConfigurationProperties(prefix = "cors")
public record CorsProperties(
        @DefaultValue({
                // Capacitor/Android WebView origin (no port)
                "http://localhost",
                // Dev servers on localhost with any port (Vite, etc.)
                "http://localhost:*",
                "http://127.0.0.1:*",
                // Android emulator host mapping
                "http://10.0.2.2:*",
                // LAN devices
                "http://192.168.*:*"
        }) List<String> allowedOrigins
) {
}
