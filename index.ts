import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./src/auth/auth.routes.js";
import userRoutes from "./src/user/user.routes.js";
import ippRoutes from "./src/ipp/ipp.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/ipp', ippRoutes); 



app.get('/api/', (req, res) => {
  res.send('Welcome to the Performance Monitoring System API');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});