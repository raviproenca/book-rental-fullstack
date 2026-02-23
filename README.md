# book-rental-fullstack

Full-stack application for book rental management, covering the complete development cycle from prototyping to containerized deployment.

## Development Lifecycle

* **Design:** UI/UX prototyping and data flow definition using **Figma**.
* **Phase 1 (POC):** Frontend developed in **Vanilla JS** using static mocks for interface validation.
* **Phase 2:** Implementation of asynchronous API consumption via **Axios**.
* **Phase 3 (Backend):** Custom REST API development using **Java Spring Boot**, **Spring Security** and **PostgreSQL**.
* **Phase 4 (Refactor):** Frontend migration to **Quasar Framework (Vue.js)** for component-based architecture.
* **Infrastructure:** Environment orchestration with **Docker** and secure deployment via **Ngrok**.

## Tech Stack

* **Frontend:** Quasar (Vue.js), Vanilla JS, HTML, CSS, Axios.
* **Backend:** Java, Spring Boot, Spring Security, Maven, PostgreSQL.
* **DevOps:** Docker, Ngrok.

## Setup & Execution

Ensure you have Docker and Docker Compose installed:

```bash
# Clone the repository
git clone [https://github.com/*/book-rental-fullstack.git](https://github.com/*/book-rental-fullstack.git)

# Run the environment
docker compose up -d
