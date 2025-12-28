# Build stage
FROM maven:3.9.9-amazoncorretto-21 AS build
WORKDIR /app

# Copy maven wrapper and pom.xml first (better caching)
COPY pom.xml .
COPY src ./src

# Build the application (skip tests for faster builds)
RUN ./mvnw clean package -DskipTests -B

# Runtime stage - smaller image
FROM openjdk:21-jdk
WORKDIR /app

# Copy the built JAR from build stage
COPY --from=build /app/target/*.jar app.jar

# # Health check
# HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
#   CMD wget -q --spider http://localhost:8080/actuator/health || exit 1

# Run with production profile
ENTRYPOINT ["java", "-jar", "-Dspring.profiles.active=prod", "app.jar"]