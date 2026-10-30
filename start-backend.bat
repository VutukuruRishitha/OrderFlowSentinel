@echo off
title OrderFlow Sentinel - Spring Boot Backend (Jatayu S6)
echo =====================================================================
echo  ORDERFLOW SENTINEL - SPRING BOOT REST API
echo  Java 21 + Spring Boot 3 + JPA / PostgreSQL / H2
echo =====================================================================
echo.
cd backend
if exist mvnw.cmd (
    call mvnw.cmd spring-boot:run
) else (
    echo Running with system Maven...
    mvn spring-boot:run
)
pause
