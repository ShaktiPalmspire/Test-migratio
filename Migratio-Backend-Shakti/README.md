# HUBSPOTAPP

## Overview
A Node.js integration app for HubSpot and Pipedrive, structured for scalability and maintainability.

## Project Structure
- `controllers/` - Route handlers and business logic
- `services/` - External API and business services
- `routes/` - Express route definitions
- `middleware/` - Express middleware
- `migration/` - Migration and logging utilities
- `config/` - Configuration management
- `tests/` - Unit and integration tests

## Setup
1. Clone the repo
2. Run `npm install`
3. Add your environment variables to `.env`
4. Start the app: `npm start`

## API Endpoints
- `/hubspot/*` - HubSpot integration endpoints
- `/pipedrive/*` - Pipedrive integration endpoints

## Testing
- Run tests with `npm test`

## Contributing
- Please open issues and pull requests for improvements. 