# book-rental-fullstack

Full-stack application for book rental management, covering the complete development cycle from prototyping to containerized deployment.

## Development Lifecycle

* **Design:** UI/UX prototyping and data flow definition using **Figma**.

*  https://www.figma.com/proto/QK1RnRJ2OahOL6z1INEAYE/WDA-Locadora-de-Livros?node-id=10-6752&p=f&t=bKvraaxIzlwZaEBM-1&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=10%3A6752
*  https://docs.google.com/document/d/1mRcqIogscCAwb9L62YEx36RA0kYk-gaq/edit?pli=1

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
