require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const businessRoutes = require('./routes/businessRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const productsRoutes = require('./routes/productsRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

// Initialize an Express application
const app = express();
app.use(express.json());
app.use(cors());

app.use('/business', businessRoutes);
app.use('/admin', adminRoutes);
app.use('/auth', authRoutes);
app.use('/products', productsRoutes);
app.use('/categories', categoryRoutes);

// Set the port for the server to listen on
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});