# Money Account Transfer System

A money account transfer system between accounts using **Django Rest Framework** and **React TypeScript**.

---

## Project Description

A web application that allows management and transfer of funds between accounts. It consists of:
- A **backend** built with Django Rest Framework.
- A **frontend** built with React TypeScript and Tailwind CSS.

---

## Main Features

- Import accounts from CSV files.
- Display the list of accounts.
- View account details.
- Transfer funds between accounts.
- Modern and user-friendly interface.

---

## Technical Requirements

### Backend
- **Python** 3.8+
- **Django** 4.x
- **Django Rest Framework**

### Frontend
- **Node.js** 16+
- **React** 18
- **TypeScript**
- **Tailwind CSS**

### Additional Tools
- **Docker** & **Docker Compose**
- **Git**

---
ء
## Installation and Running the Project

### Clone the repository:
```bash
git clone https://github.com/MuhammadMagdy7/money-transfer
cd money-transfer
```

### Access the application:
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **API Interface**: [http://localhost:8000](http://localhost:8000)

### Run the project using Docker:
```bash
docker-compose up --build
```
---

### API Endpoints

#### Accounts
- `GET /api/accounts/` - List of accounts
- `GET /api/accounts/{id}/` - Details of a specific account
- `POST /api/accounts/import_csv/` - Import accounts from a CSV file

#### Transfers
- `POST /api/accounts/transfer/` - Perform a transfer between two accounts

Tests
Run backend unit tests:
```bash
cd backend
python manage.py test
```
Run frontend tests:
```bash
cd frontend
npm test
```
## License
This project is licensed under the MIT License.
