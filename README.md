# Cryptocurrency Exchange Rates API

This API tracks exchange rates of various cryptocurrencies based on the Binance API.

## Getting Started

### Prerequisites

- Node.js
- Docker (optional, for running with Docker)

### Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/flove1/crypto-exchange
   cd crypto-exchange
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Set up environment variables:
   - Copy ```.env.example``` to ```.env``` and update the values as needed.

### Running the Application

#### Development Mode

To start the application in development mode:

```sh
npm run start:dev
```

#### Production Mode

To start the application in production mode:

```sh
npm run start:prod
```

### Running with Docker

1. Build the Docker image:

   ```sh
   docker build -t crypto-api .
   ```

2. Run the Docker container:


    ```sh
    docker run -d -p 3000:3000 --env-file .env --name crypto-api-container crypto-api
    ```

3. Verify the container is running:


    ```sh
    docker ps
    ```

4. Access the API at `http://localhost:3000`.

### Running with Docker Compose

1. Start the application with Docker Compose:

```sh
docker-compose up -d
```

2. Verify the services are running:

```sh
docker-compose ps
```

3. Access the API at `http://localhost:3000`.

### Testing

To run tests:

```sh
npm test
```

### API Documentation

API documentation is available at `/api` when the application is running.
