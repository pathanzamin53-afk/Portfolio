import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import contactRoutes from "./routes/contactRoutes.js";
import { connectDatabase } from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

const app = express();
app.set("trust proxy", 1);
const port = Number(process.env.PORT) || 5000;
const allowedOrigins = (
  process.env.CLIENT_ORIGIN || "http://127.0.0.1:5500,http://localhost:5500"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin))
        return callback(null, true);
      return callback(new Error("CORS origin is not allowed."));
    },
  }),
);
app.use(express.json({ limit: "10kb", strict: true }));
app.use(express.urlencoded({ extended: false, limit: "10kb" }));
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many messages. Please try again later." },
});
app.get("/api/health", (request, response) =>
  response.json({ status: "ok", service: "developer-portfolio-api" }),
);
app.use("/api/contact", contactLimiter, contactRoutes);
app.use(notFound);
app.use(errorHandler);

async function start() {
  app.listen(port, () =>
    console.log(`Portfolio API listening on http://localhost:${port}`),
  );
  try {
    await connectDatabase();
  } catch (error) {
    console.error(`MongoDB unavailable: ${error.message}`);
  }
}

if (!process.env.VERCEL && process.env.NODE_ENV !== "test") start();
export default app;
