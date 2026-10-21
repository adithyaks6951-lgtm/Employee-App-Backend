# Employee App Backend Integration

## Setup
1. Install Node.js LTS and open this folder in VS Code.
2. Run `npm install`.
3. Copy `.env.example` to a file named `.env`.
4. Replace the placeholder `MONGODB_URI` with your MongoDB Atlas connection string. Never commit or share `.env`.
5. In Atlas, add your current IP address under Network Access and ensure the database user has read/write permissions.
6. Run `npm start` and open http://localhost:3000.

The app uses database `EmployeeDB` and collection `employees` by default. MongoDB creates them when the first record is inserted.

## API endpoints
- `GET /api/employeelist` — list all employees
- `GET /api/employeelist/:id` — retrieve one employee
- `POST /api/employeelist` — add an employee
- `PUT /api/employeelist` — update an employee; body must include `_id`
- `DELETE /api/employeelist/:id` — delete an employee

Employee fields: `name`, `location`, `position`, `salary`.

Example POST body:
```json
{"name":"Alex","location":"Kochi","position":"Developer","salary":30000}
```

## GitHub submission
Commit `app.js`, `package.json`, `.env.example`, `.gitignore`, `README.md`, and `dist/Frontend`. Do not commit `.env` or `node_modules`.
