const { setServers } = require("node:dns/promises");
setServers(["1.1.1.1", "8.8.8.8"]);

const express = require('express');
const dotenv = require('dotenv');
const cookieParser=require('cookie-parser');
const connectDB = require('./config/db');

//Load env vars
dotenv.config({path: './config/config.env'});

//Connect to database
connectDB();

const campgrounds = require('./routes/campgrounds');
const auth = require('./routes/auth');
const bookings =require('./routes/bookings');
const reviews = require('./routes/reviews')
const mongoSanitize = require('express-mongo-sanitize');
const reviews = require('./routes/reviews')
const helmet = require('helmet');
const { xss } = require('express-xss-sanitizer');
const rateLimit = require('express-rate-limit');
// Rate Limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 1000
});
const hpp = require('hpp');
const cors = require('cors');
const app=express();

app.use(express.json());

//Cookie parser
app.use(cookieParser());
app.set('query parser', 'extended');
// Sanitize data
app.use(mongoSanitize({replaceWith: '_',}));
// Set security headers
app.use(helmet());
// Prevent xss attacks
app.use(xss());

app.use(limiter);

// Prevent http param pollutions
app.use(hpp());

// Enable CORS
app.use(cors());

app.use('/api/v1/campgrounds', campgrounds);
app.use('/api/v1/auth',auth);
app.use('/api/v1/bookings', bookings);
<<<<<<< HEAD
app.use('/api/v1/reviews', reviews)
=======
app.use('/api/v1/reviews', reviews);
>>>>>>> f/create

const PORT=process.env.PORT || 5000;
const server = app.listen (PORT,console.log('Server running in ', process.env.NODE_ENV, ' mode on port ', PORT));

//Handle unhandled promise rejections
process.on('unhandledRejection', (err,promise)=>{
    console.log(`Error: ${err.message}` );
    //Close server & exit process 
    server.close(()=>process.exit(1));
});
