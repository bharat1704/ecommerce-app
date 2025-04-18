const mongoose = require("mongoose");
const User = require("./models/user.model");
require("dotenv").config();

const users = [
  {
    name: "John Doe",
    email: "john.doe@example.com",
    password: "password123", // Ensure passwords are hashed in your model
    role: "user",
  },
  {
    name: "Admin User",
    email: "admin@example.com",
    password: "admin123", // Ensure passwords are hashed in your model
    role: "admin",
  },
];

async function seedUsers() {
  try {
    // Retry mechanism for MongoDB connection
    const connectWithRetry = async (retries = 5) => {
      try {
        console.log(`Attempting to connect to MongoDB (${retries} retries left)...`);
        await mongoose.connect(process.env.MONGO_URI, {
          serverSelectionTimeoutMS: 5000,
        });
        console.log("Connected to MongoDB successfully");
      } catch (error) {
        console.error("Failed to connect to MongoDB:", error.message);
        if (retries > 0) {
          console.log("Retrying in 5 seconds...");
          await new Promise((resolve) => setTimeout(resolve, 5000));
          await connectWithRetry(retries - 1);
        } else {
          throw new Error("Could not connect to MongoDB after multiple attempts");
        }
      }
    };

    await connectWithRetry();

    // Seed Users
    const existingUsers = await User.find({});
    if (existingUsers.length === 0) {
      await User.insertMany(users);
      console.log("Users seeded successfully");
    } else {
      console.log("Users already exist");
    }
  } catch (error) {
    console.error("Error in seedUsers:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

seedUsers().catch(console.error);