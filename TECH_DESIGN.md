# Expense Engine - Technical Design Document

## 1. Overview
Expense Engine is a containerized web application designed to track financial liabilities (starting with EMIs and loans) and manage personal expenses. It provides a real-time dashboard for monitoring total debt, monthly payments, and active loan progress.

## 2. Architecture
The application follows a standard layered monolithic architecture, containerized for easy deployment and consistency across environments.

### 2.1 Core Components
*   **Web Frontend**: A single-page application (SPA) built with React, Vite, and Shadcn UI, running in the browser. It communicates with the backend via RESTful APIs.
*   **Backend API**: A Spring Boot Java application that provides REST endpoints for managing EMI data.
*   **Database**: A PostgreSQL relational database for persistent storage.
*   **Container Runtime**: Docker and Docker Compose orchestrate the backend and database containers.

### 2.2 System Diagram
```mermaid
graph TD
    Client[Browser (React SPA)] <-->|REST over HTTP| API[Spring Boot App (Port 8080)]
    API <-->|JDBC| DB[(PostgreSQL Server (Port 5432))]
    
    subgraph Docker Compose Network
        API
        DB
    end
```

## 3. Tech Stack
*   **Language**: Java 17
*   **Framework**: Spring Boot 3.x (Web, Data JPA)
*   **Database**: PostgreSQL 16
*   **Build Tool**: Maven (with Maven Wrapper), npm/Vite
*   **Frontend**: React 18, Vite, Tailwind CSS (v3), Shadcn UI Primitives
*   **Orchestration**: Docker, Docker Compose

## 4. Backend Design (Server-Side)

### 4.1 Layered Architecture
The Spring Boot application is organized into the following layers to ensure separation of concerns:

1.  **Controllers (`com.bharat.emitracker.controller`)**: Handle incoming HTTP API requests, validate input, and route to the appropriate Service methods.
2.  **Services (`com.bharat.emitracker.service`)**: Contain the core business logic. They orchestrate data retrieval, execute financial calculations (EMI, remaining principal, etc.), and map entities to DTOs.
3.  **Repositories (`com.bharat.emitracker.repository`)**: Spring Data JPA interfaces for database access.
4.  **Entities (`com.bharat.emitracker.entity`)**: JPA classes representing database tables (e.g., `EmiRecord`).
5.  **DTOs (`com.bharat.emitracker.dto`)**: Data Transfer Objects used to send aggregated or calculated data to the frontend without exposing raw database entities.

### 4.2 Data Model (`EmiRecord`)
The core entity tracks individual loans.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `Long` (PK) | Unique identifier |
| `name` | `String` | Loan description (e.g., "Car Loan") |
| `principal` | `Double` | Original loan amount |
| `interestRate` | `Double` | Annual interest rate percentage |
| `tenureMonths` | `Integer` | Total duration of the loan |
| `monthlyEmi` | `Double` | Calculated baseline monthly payment |
| `startDate` | `LocalDate` | (Optional) Start date of the loan |
| `explicitCompletedMonths` | `Integer` | (Optional) Manually overridden completed months |

### 4.3 Key Business Logic
The `EmiService` is responsible for dynamic calculations on the fly whenever data is requested:
*   **Monthly EMI**: Calculated upon creation using the standard Amortization formula: `EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)`.
*   **Completed Months**: Derived by checking `explicitCompletedMonths` first. If null, it calculates the difference between `startDate` and the current date.
*   **Remaining Principal**: Dynamically calculated based on the completed months using: `Balance = P * [(1+r)^n - (1+r)^p] / [(1+r)^n - 1]`.

## 5. Frontend Design (Client-Side)

### 5.1 Structure
The UI is a Vite React application located in the `frontend/` directory. It uses a feature-based folder structure:
*   `src/components/ui/`: Reusable Radix/Tailwind building blocks (Shadcn UI like `Button`, `Card`, `Dialog`).
*   `src/features/emi/`: Encapsulated feature modules containing API services (`emiService.js`), custom hooks (`useEmiData.js`), and domain components (`EmiCard`, `AddEmiForm`, `BatchPayModal`).
*   `src/pages/`: Main views orchestrating features (e.g., `DashboardPage.jsx`).
*   `src/utils/`: Shared utilities (`emiCalculations.js`, `formatCurrency.js`).

### 5.2 Application State & Logic
*   **State Management**: Handled via custom React hooks (e.g., `useEmiData`) that encapsulate the fetching, loading state, error handling, and offline fallback mechanisms.
*   **Declarative UI**: React components re-render efficiently based on state updates. Shadcn UI components provide accessible, unstyled primitives styled with Tailwind CSS utility classes.
*   **Resiliency (Offline Fallback)**: If the backend API `fetch` requests fail (e.g., the Docker container stops), the hook gracefully degrades to managing state in the browser's `localStorage`, utilizing a `calculateFallbackMetrics` subroutine dynamically imported to simulate the Java backend calculations offline.

## 6. Infrastructure & Deployment

### 6.1 Docker Configuration
*   **Dockerfile**: Uses a 3-stage multi-stage build sequence.
    *   *Stage 1 (Frontend Builder)*: Uses `node:20-alpine` to install dependencies and `npm run build` the Vite React application into a `dist/` directory.
    *   *Stage 2 (Backend Builder)*: Uses Maven and Eclipse Temurin 17 JDK to copy the React `dist/` files into Spring Boot's `src/main/resources/static/`, and then compiles the Spring Boot `app.jar`.
    *   *Stage 3 (Runtime)*: Uses a minimal Eclipse Temurin 17 JRE image to run the compiled jar, effectively serving the monolithic React + Java application from a single lightweight container.
*   **Docker Compose**: Defines two services:
    1.  `db`: The PostgreSQL container. Maps port 5433 on the host to 5432 in the container to avoid conflicts with local DBs.
    2.  `app`: The Spring Boot application. Exposes port 8080. It utilizes `host.docker.internal` (via `extra_hosts` on Linux) to connect to the database container network smoothly.

### 6.2 Security Considerations
*   Database credentials are not hardcoded. They are passed via environment variables during Docker runtime.
*   A local `.env` file feeds secrets into `docker-compose.yml`, which translates them to `SPRING_DATASOURCE_*` properties for the Spring container.

## 7. Future Expansion Patterns
*   **Extensibility**: The layered MVC architecture allows easy addition of new entities (e.g., `DailyExpense`, `IncomeSource`) by creating new Entity/Repository/Service/Controller sets alongside the `Emi` structure.
*   **Frontend Scaling**: The React UI is modularized by feature. Adding a new module just requires creating a new folder in `src/features/` with its own components, context hooks, and API services.
