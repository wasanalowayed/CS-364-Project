const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// MongoDB connection string
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/createAccountDB';

// Middleware to parse request body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define User schema and model
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  birthDate: { type: Date, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  gender: { type: String, required: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Serve the registration form
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'createAccount.html'));
});

// Route to handle user registration
app.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, birthDate, email, phone, gender, password } = req.body;

    // Create a new user
    const newUser = new User({ firstName, lastName, birthDate, email, phone, gender, password });

    // Save the user to the database
    await newUser.save();

    res.status(201).send('User registered successfully');
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      // Duplicate key error (e.g., email already exists)
      res.status(400).send('Email already exists');
    } else {
      res.status(500).send('Server error');
    }
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

