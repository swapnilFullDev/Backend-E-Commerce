require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const businessRoutes = require('./routes/businessRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const productsRoutes = require('./routes/productsRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const deliveryRoutes = require('./routes/deliveryRiderRoutes');
const userRoutes = require('./routes/userRoutes');
const morgan = require('morgan');
// Initialize an Express application
const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan('common'));
const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "MyApp API",
      version: "1.0.0",
      description: "Automatically generated Swagger docs",
    },
  },
  apis: ["./routes/*.js"], // Path to your route files
};

const swaggerSpec = swaggerJsdoc(options);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/business', businessRoutes);
app.use('/admin', adminRoutes);
app.use('/auth', authRoutes);
app.use('/products', productsRoutes);
app.use('/categories', categoryRoutes);
app.use('/inventory', inventoryRoutes);
app.use('/delivery', deliveryRoutes);
app.use('/api/user', userRoutes);
// Set the port for the server to listen on
const port = 3000;
// app.listen(port, () => {
//   const host = process.env.RENDER_EXTERNAL_URL || `http://localhost:${port}`;
//   console.log(`✅ Server is running at: ${host}`);
//   console.log(`Server is running at http://localhost:${port}`);
//   }
// );
app.listen(port, '192.168.0.171',() => {
  console.log(`Server is running at http://192.168.0.193:${port}`);
});