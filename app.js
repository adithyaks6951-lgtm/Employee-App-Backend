// Employee App Backend Integration
// The provided dist/Frontend files are served unchanged.

const express = require('express');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'dist', 'Frontend')));

let employeesCollection;

function toObjectId(id) {
  if (!ObjectId.isValid(id) || String(new ObjectId(id)) !== String(id)) return null;
  return new ObjectId(id);
}

function employeeFields(body) {
  const fields = {};
  for (const key of ['name', 'location', 'position', 'salary']) {
    if (body[key] !== undefined) fields[key] = body[key];
  }
  return fields;
}

// GET all employees
app.get('/api/employeelist', async (req, res) => {
  try {
    res.status(200).json(await employeesCollection.find({}).toArray());
  } catch (error) {
    console.error('Get employees failed:', error);
    res.status(500).json({ message: 'Failed to retrieve employees.' });
  }
});

// GET one employee by ID
app.get('/api/employeelist/:id', async (req, res) => {
  try {
    const id = toObjectId(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid employee ID.' });
    const employee = await employeesCollection.findOne({ _id: id });
    if (!employee) return res.status(404).json({ message: 'Employee not found.' });
    res.status(200).json(employee);
  } catch (error) {
    console.error('Get employee failed:', error);
    res.status(500).json({ message: 'Failed to retrieve employee.' });
  }
});

// POST a new employee
app.post('/api/employeelist', async (req, res) => {
  try {
    const fields = employeeFields(req.body);
    if (!fields.name || !fields.location || !fields.position ||
        fields.salary === undefined || fields.salary === '') {
      return res.status(400).json({
        message: 'name, location, position and salary are required.'
      });
    }
    const result = await employeesCollection.insertOne(fields);
    res.status(201).json(await employeesCollection.findOne({ _id: result.insertedId }));
  } catch (error) {
    console.error('Add employee failed:', error);
    res.status(500).json({ message: 'Failed to add employee.' });
  }
});

// DELETE one employee by ID
app.delete('/api/employeelist/:id', async (req, res) => {
  try {
    const id = toObjectId(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid employee ID.' });
    const result = await employeesCollection.deleteOne({ _id: id });
    if (!result.deletedCount) return res.status(404).json({ message: 'Employee not found.' });
    res.status(200).json({ message: 'Employee deleted successfully.' });
  } catch (error) {
    console.error('Delete employee failed:', error);
    res.status(500).json({ message: 'Failed to delete employee.' });
  }
});

// PUT update employee; frontend sends _id in the employee object
app.put('/api/employeelist', async (req, res) => {
  try {
    const id = toObjectId(req.body._id);
    if (!id) return res.status(400).json({ message: 'A valid employee _id is required.' });
    const fields = employeeFields(req.body);
    if (!Object.keys(fields).length) {
      return res.status(400).json({ message: 'No employee fields provided to update.' });
    }
    const result = await employeesCollection.updateOne({ _id: id }, { $set: fields });
    if (!result.matchedCount) return res.status(404).json({ message: 'Employee not found.' });
    res.status(200).json(await employeesCollection.findOne({ _id: id }));
  } catch (error) {
    console.error('Update employee failed:', error);
    res.status(500).json({ message: 'Failed to update employee.' });
  }
});

// Keep the frontend fallback for client-side routes.
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'Frontend', 'index.html'));
});

async function startServer() {
  if (!process.env.MONGODB_URI) {
    console.error('Missing MONGODB_URI. Create a .env file using .env.example.');
    process.exit(1);
  }
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db(process.env.MONGODB_DB || 'EmployeeDB');
    employeesCollection = db.collection('employees');
    app.listen(PORT, () => {
      console.log(`Employee App running at http://localhost:${PORT}`);
      console.log(`Connected to MongoDB database: ${db.databaseName}`);
    });
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

startServer();
