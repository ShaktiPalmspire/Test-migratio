# Project Architecture

## Overview
This project integrates HubSpot and Pipedrive APIs using a modular Node.js architecture.

## Folder Structure
- `controllers/`: Handles incoming requests and calls services.
- `services/`: Contains business logic and API integrations.
- `routes/`: Express route definitions.
- `middleware/`: Custom Express middleware.
- `migration/`: Migration and logging utilities.
- `config/`: Centralized configuration management.
- `tests/`: Unit and integration tests.
- `docs/`: Project documentation.

## Flow
1. Request hits a route in `routes/`.
2. Route calls a controller in `controllers/`.
3. Controller uses services in `services/`.
4. Services interact with external APIs or databases.
5. Middleware is used for authentication, logging, etc. 