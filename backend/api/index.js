import app from "../server.js";
import { connectDatabase } from "../config/db.js";

export default async function handler(request, response) {
  try {
    await connectDatabase();
    return app(request, response);
  } catch (error) {
    console.error(`Unable to connect to MongoDB: ${error.message}`);
    return response
      .status(500)
      .json({ message: "Database connection failed." });
  }
}
