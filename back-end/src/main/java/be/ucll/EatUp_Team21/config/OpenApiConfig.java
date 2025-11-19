package be.ucll.EatUp_Team21.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "EatUp Team21 API",
                version = "v1",
                description = "API for EatUp mobile backend",
                contact = @Contact(name = "Team 21", email = "team21@example.com")
        )
)
public class OpenApiConfig {

}
