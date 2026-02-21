# Stage 1: Build the React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build the Spring Boot application
FROM maven:3.9.6-eclipse-temurin-17 AS backend-builder
WORKDIR /app

# Copy maven files
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
COPY mvnw.cmd .
COPY src ./src

# Copy the built React app into the static resources directory of Spring Boot
COPY --from=frontend-builder /app/frontend/dist ./src/main/resources/static

# Create a clean build skipping tests for faster containerization
RUN mvn clean package -DskipTests

# Stage 2: Create simple minimal production image
FROM eclipse-temurin:17-jre

WORKDIR /app
COPY --from=backend-builder /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
