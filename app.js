if(process.env.NODE_ENV != 'production') {
    require('dotenv').config();
}


const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError= require('./utils/ExpressError.js');
const session = require('express-session');
const MongoStore = require('connect-mongo'); // For session storage in MongoDB
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");


const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


//const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlusts";

const dburl = process.env.ALTASDB_URL;

main()
   .then(() => {
    console.log('Connected to MongoDB');
  })
   .catch(err => {
    console.log(err);
 });

 async function main() {
    await mongoose.connect(dburl );
};

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, 'public')));

const store = MongoStore.create({
    mongoUrl: dburl,
    crypto: {
        secret: process.env.SECRET, // Use a secret for encrypting session data
    },
    touchAfter: 24 * 3600, // time in seconds after which the session will be updated
});

store.on("error" , () => {
    console.log("Session Store Error" , err);
})

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true, 
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true,
    },
};


// app.get('/', (req, res) => {
//     res.send('Hello I am Root!');
// });



app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// app.get("/demoUser", async(req, res) => {
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "delta-student"
//     }
//     );

//    let registerUser = await User.register(fakeUser, "helloWorld");
//    res.send(registerUser);
// });

// router
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews" , reviewRouter);
app.use("/", userRouter);



// Catch-all route for undefined routes
app.all('/{*any}', (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});


app.use((err, req, res, next) => {
    let {statusCode = 500 , message = "something went wrong"} = err;
    res.status(statusCode).render('error.ejs',{message});
    
    //res.status(statusCode).send(message);
});


app.listen(8080, () => {    
    console.log('Server is running on port 8080');

});
