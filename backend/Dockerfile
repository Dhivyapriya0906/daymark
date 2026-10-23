FROM maven:3.9.9-eclipse-temurin-17 AS build

WORKDIR /workspace
COPY pom.xml ./
COPY src ./src
RUN mvn --batch-mode --no-transfer-progress -DskipTests package

FROM eclipse-temurin:17-jre-jammy

WORKDIR /app
RUN groupadd --system spring && useradd --system --gid spring spring
COPY --from=build --chown=spring:spring /workspace/target/task-management-app-1.0.0.jar /app/app.jar
USER spring:spring
EXPOSE 10000
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "/app/app.jar"]
