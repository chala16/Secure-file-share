const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/AuthRoute');
const fileRoutes = require('./routes/fileRoutes');
dotenv.config();
const app = express();

app.use(cors(
  { origin: "*"} // Allow all origins for simplicity
));
app.use(express.json());
app.use("/api/auth", authRoutes);        
app.use('/api/files', fileRoutes);
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

connectDB();

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});