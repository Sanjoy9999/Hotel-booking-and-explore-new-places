if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

// Ensure we have a SECRET value for sessions
if (!process.env.SECRET) {
    process.env.SECRET = 'fallbacksecretkey';
    console.warn('WARNING: Using fallback secret key. For production, set a SECRET in your environment variables.');
}


const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const expressError = require('./utils/expressError');
const listingRoutes = require('./routes/listing.js');
const reviewRoutes = require('./routes/review.js');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const userRoutes = require('./routes/user.js');


// Set & use engines and directorys
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);

// Database Connection success
const dbUrl = process.env.ATLAS_DB_URL;

main().then(() => console.log('Connected to database')).catch(err => console.error(err));

async function main() {
    await mongoose.connect(dbUrl);
}

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret : process.env.SECRET,
    },
    touchAfter: 24 * 3600
});

store.on('error', (err) => {
    console.log('ERROR IN MONGO SESSION STORE!', err);
})

const sessionOptions = {
    store,
    secret : process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionOptions));  // Session
app.use(flash());
app.use(passport.initialize());  // Passport initialize for authentication
app.use(passport.session());     // Passport session for authentication

passport.use(new LocalStrategy(User.authenticate()));  // Local strategy for authentication

passport.serializeUser(User.serializeUser());  // Serialize user
passport.deserializeUser(User.deserializeUser());  // Deserialize user


app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user || null;
    next();
});  

// Listing routes
app.use('/listings', listingRoutes);

// review routes
app.use('/listings/:id/reviews', reviewRoutes);

// user routes
app.use('/', userRoutes);

// 404 route
app.all('*', (req, res, next) => {
    next(new expressError('Page Not Found', 404));
});


// error handling middleware
app.use((err, req, res, next) => {
    let { statusCode = 500, message = 'Something went wrong' } = err;
    res.status(statusCode).render("error.ejs", { err });
});


// Server listening
app.listen(8080, () => {
    console.log('Server is running on port 8080');
});
