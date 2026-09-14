import mongoose from "mongoose";

let connectionPromise;

export async function connectDatabase(uri = process.env.MONGODB_URI) {
  if (!uri) throw new Error("MONGODB_URI is not configured.");
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (!connectionPromise) {
    mongoose.connection.once("connected", () =>
      console.log("MongoDB connected"),
    );
    mongoose.connection.on("error", (error) =>
      console.error("MongoDB error:", error.message),
    );
    connectionPromise = mongoose.connect(uri).catch((error) => {
      connectionPromise = undefined;
      throw error;
    });
  }
  await connectionPromise;
  return mongoose.connection;
}

export async function closeDatabase() {
  connectionPromise = undefined;
  await mongoose.connection.close();
}
