require('dotenv').config()
const express = require('express')

// Improved error logging
process.on('uncaughtException', (error) => {
    console.error(`UNCAUGHT EXCEPTION! Shutting down...`);
    console.error('Name:', error.name);
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
});

const app = express()
const cors = require('cors')
const {connectWithDB} = require("./db/dbConnection")
const { globalErrorHandler } = require('./utils/globalErrorHandler')
const cookieParser = require('cookie-parser')
const { seedData } = require('./controllers/product.controller')
const {seedCategory} = require("./controllers/category.controller")
const {seedBrand} = require("./controllers/brand.controller")
const {ApiError} = require("./utils/ApiError")

const PORT = process.env.PORT || 5000

// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.CORS_ORIGIN 
        : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie']
};

app.use(cors(corsOptions));

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

app.use(cookieParser())
app.use(express.json());

// Database connection with improved logging
connectWithDB()
.then(() => {
    console.log("Successfully connected with database");
    
    // Start server after successful database connection
    const server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });

    // Graceful shutdown
    process.on('unhandledRejection', (error) => {
        console.error(`UNHANDLED REJECTION! Shutting down...`);
        console.error('Name:', error.name);
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);

        server.close(() => {
            process.exit(1);
        });
    });
})
.catch((error) => {
    console.error('Failed to connect to database:', error);
    process.exit(1);
});

// Root endpoint
app.get('/', (req, res) => {
    res.send("This is home page")
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected'
    });
});

// import routes
const authRoute = require('./router/auth.route')
const cartRoute = require('./router/cart.route')
const productRoute = require('./router/product.router')
const orderRoute = require('./router/order.route')
const userRoute = require('./router/user.route')
const brandRoute = require('./router/brand.route')
const categoryRoute = require('./router/category.route')
const wishlistRoute =  require("./router/wishlist.route")

app.use('/api/auth',authRoute)
app.use('/api/cart',cartRoute)
app.use('/api/products',productRoute)
app.use('/api/orders',orderRoute)
app.use('/api/user',userRoute)
app.use('/api/brand',brandRoute)
app.use('/api/category',categoryRoute)
app.use('/api/wishlist',wishlistRoute)

app.all("*",(req,res,next)=>{
    next(new ApiError(404,`This path ${req.originalUrl} is not on the server`))
})

app.use(globalErrorHandler);

module.exports = app;
