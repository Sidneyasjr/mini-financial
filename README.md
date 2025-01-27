# Mini Financial System

A financial system built with NestJS and PostgreSQL that allows managing financial transactions, wallets, and users.

## 🚀 Technologies

- [Node.js](https://nodejs.org/)
- [NestJS](https://nestjs.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [TypeORM](https://typeorm.io/)
- [JWT](https://jwt.io/)
- [Class Validator](https://github.com/typestack/class-validator)
- [Swagger](https://swagger.io/)

## 📋 Requirements

- Node.js >= 23
- Docker and Docker Compose
- npm or yarn

## 🔧 Installation

1. Clone the repository
```bash
git clone https://github.com/Sidneyasjr/mini-financial.git
cd mini-financial
```

2. Install dependencies
```bash
npm install
```

3. Start Docker containers
```bash
docker-compose up -d
```

4. Set up environment variables
```bash
cp .env.example .env
```
Edit the .env file with your local settings


5. Run migrations
```bash
npm run migration:run
```

6. Start the development server
```bash
npm run start:dev
```

## 📚 API Documentation

API documentation is available through Swagger UI at:
```
http://localhost:3000/api
```