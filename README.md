# Expense Engine 💸 

> A modern, mindful approach to tracking your money—starting with your EMIs and Loans.

[![Spring Boot](https://img.shields.io/badge/Spring_Boot-F2F4F9?style=for-the-badge&logo=spring-boot)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

Expense Engine (formerly EmiTracker) is a beautifully designed, containerized web application built to help you stay on top of your financial liabilities. It provides real-time calculations for your active loans and tracking modules for your monthly payments seamlessly.

## 🌟 Features

- **Premium UI**: Dark mode dashboard featuring glassmorphism design, colorful gradients, and smooth interactive elements.
- **Advanced EMI Tracking**: Input your starting date OR your manual completed months. The application dynamically calculates your remaining balance, completed tenure, and total amount paid.
- **Batch Payments**: A dedicated Batch Pay modal to increment multiple loans with a single click.
- **Offline Fallback**: Even if your PostgreSQL backend container goes down, the frontend seamlessly cascades to browser `localStorage` to keep your progress tracked.
- **Fully Dockerized**: Spins up the entire Java backend and PostgreSQL database with a single Docker command.



## 🚀 Getting Started

Because the application is fully containerized, setting up Expense Engine on your local machine is incredibly fast.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed on your machine.
- [Git](https://git-scm.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Bharatchandran/expense-engine.git
   cd expense-engine
   ```

2. **Setup your environment variables:**
   Create a `.env` file in the root directory to store your local database credentials securely.
   ```bash
   echo "POSTGRES_PASSWORD=your_secure_password" > .env
   ```
   *(Note: The `.env` file is intentionally ignored by git so your credentials stay safe).*

3. **Spin up the containers:**
   Use Docker Compose to build the Spring Boot `.jar` and spin up both the App and the Database.
   ```bash
   docker compose up --build -d
   ```

4. **Access the Application:**
   Open your browser and navigate to:
   ```
   http://localhost:8080/
   ```

## 🛠 Tech Stack

- **Backend:** Java 17, Spring Boot 3, Spring Data JPA, Hibernate.
- **Database:** PostgreSQL 16 (Running via Docker).
- **Frontend:** HTML5, Vanilla JavaScript, CSS3 (No heavy frontend frameworks, strictly lightweight and fast).
- **Infrastructure:** Docker, Docker Compose, multi-stage Docker builds.

## 🗺 Roadmap

Expense Engine is just getting started. Future updates include:
- [ ] General daily expense tracking modules.
- [ ] Income vs. Liability ratio charts.
- [ ] Categorization and tagging of expenses.
- [ ] User authentication and secure logins.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.
