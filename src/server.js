import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { initDB } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";

import transactionsRoute from "./routes/transactionsRoute.js";
import job from "./config/cron.js";
dotenv.config();
console.log("NODE_ENV :", process.env.NODE_ENV);
if (process.env.NODE_ENV === "production") job.start(); // Start the cron job


const app = express();
app.use(cors());

// middleware
app.use(express.json());


app.get('/api/health', (req, res) => {
  res.status(200).json({ message: "API is running" });
})


app.use(rateLimiter);
const PORT = process.env.PORT || 5001;

// middleware to handle JSON requests




app.use("/api/transactions", transactionsRoute);

initDB().then(() => {
  app.listen(PORT, () => {
    console.log("server is running on port 5001");
  });
});
