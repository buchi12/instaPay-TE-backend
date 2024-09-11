import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import authRoute from './routes/authRoute.js';

dotenv.config(); // To load environment variables from a .env file

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World');
});

// Fix the route prefix
app.use('/api/auth', authRoute);

// Connecting to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Failed to connect to MongoDB', error));

// Starting the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
