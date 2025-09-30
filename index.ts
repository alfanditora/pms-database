import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./src/auth/auth.routes.js";
import userRoutes from "./src/user/user.routes.js";
import ippRoutes from "./src/ipp/ipp.routes.js";
import deptRoutes from "./src/department/department.routes.js";
import categoryRoutes from "./src/category/category.routes.js";

import { errorHandler } from "./src/middleware/error.middleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;


app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/ipp', ippRoutes); 
app.use('/api/department', deptRoutes);
app.use('/api/category', categoryRoutes);

app.get('/api/', (req, res) => {
  res.send('Welcome to the Performance Monitoring System API');
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
