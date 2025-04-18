const mongoose = require("mongoose");
const Product = require("./models/product.model");
const Category = require("./models/category.model");
const Brand = require("./models/brand.model");
require("dotenv").config();

const categories = [
  { label: "Electronics" },
  { label: "Clothing" },
  { label: "Shoes" },
  { label: "Watches" },
  { label: "Accessories" },
];

const brands = [
  { label: "Nike" },
  { label: "Samsung" },
  { label: "Apple" },
  { label: "Adidas" },
  { label: "Puma" },
  { label: "Casio" },
];

const products = [
  {
    title: "Nike Air Max 270",
    description: "Men's Running Shoes with Air cushioning for maximum comfort",
    category: "Shoes",
    price: 150,
    discountPercentage: 10,
    brand: "Nike",
    thumbnail: "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/skwgyqrbfzhu6uyeh0gg/air-max-270-shoes-2V5C4p.png",
    images: [
      "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/skwgyqrbfzhu6uyeh0gg/air-max-270-shoes-2V5C4p.png",
      "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:n0wzh4xqxqo6lxqf6zaj/air-max-270-shoes-2V5C4p.png",
    ],
    stock: 45,
  },
  {
    title: "Samsung Galaxy S21",
    description: "5G Android Smartphone with 128GB Storage",
    category: "Electronics",
    price: 799,
    discountPercentage: 15,
    brand: "Samsung",
    thumbnail: "https://images.samsung.com/is/image/samsung/p6pim/in/galaxy-s21/gallery/in-galaxy-s21-5g-g991-371429-sm-g991bzvdinu-thumb-368891574",
    images: [
      "https://images.samsung.com/is/image/samsung/p6pim/in/galaxy-s21/gallery/in-galaxy-s21-5g-g991-371429-sm-g991bzvdinu-thumb-368891574",
    ],
    stock: 25,
  },
];

async function seedDatabase() {
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

    // Seed Categories
    const existingCategories = await Category.find({});
    if (existingCategories.length === 0) {
      await Category.insertMany(categories);
      console.log("Categories seeded successfully");
    } else {
      console.log("Categories already exist");
    }

    // Seed Brands
    const existingBrands = await Brand.find({});
    if (existingBrands.length === 0) {
      await Brand.insertMany(brands);
      console.log("Brands seeded successfully");
    } else {
      console.log("Brands already exist");
    }

    // Seed Products
    const existingProducts = await Product.find({});
    if (existingProducts.length === 0) {
      await Product.insertMany(products);
      console.log("Products seeded successfully");
    } else {
      console.log("Products already exist");
    }
  } catch (error) {
    console.error("Error in seedDatabase:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

seedDatabase().catch(console.error);