var express = require("express");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");

var ejs = require("ejs");
var engine = require("ejs-mate");
var session = require("express-session");
const { static } = require("express");
const { Mongoose } = require("mongoose");
var MongoStore = require("connect-mongo")(session);
var mongoose = require("mongoose");
const { Store } = require("express-session");
var passport = require("passport");
var flash = require("connect-flash");
var validator = require("express-validator");

var app = express();

//mongoose.connect('mongodb://localhost/rateme', { useNewUrlParser: true, useUnifiedTopology: true });
// const url =
//   "mongodb://Magi:magi123456789@signatures-shard-00-00.hqwct.mongodb.net:27017,signatures-shard-00-01.hqwct.mongodb.net:27017,signatures-shard-00-02.hqwct.mongodb.net:27017/RateMe?ssl=true&replicaSet=atlas-6iz4ms-shard-0&authSource=admin&retryWrites=true&w=majority";
// mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });


//const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://jobadmin:bCcRsbUoZnZObKXi@jobportal.eimxd.mongodb.net/jobportal?retryWrites=true&w=majority";
//const client = new MongoClient(uri, { useNewUrlParser: true });
//client.connect();
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
.catch(error => console.log(error));
if(mongoose.connection.readyState){
  console.log("DB connection using new URL successful")
}
else{
  console.log("DB is not connected")
}
//if(mongoose.)
// err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });


require("./config/passport");

app.use(express.static("public"));
app.engine("ejs", engine);
app.set("view engine", "ejs");
app.set("views", "./views");
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(bodyParser.json);

app.use(
  session({
    secret: "thisismine",
    resave: "false",
    saveUninitialized: "false",
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

//require("./routes/userRouter")(app, passport);
require("./routes/customerRouter")(app, passport);

require('./secret/secret');

app.get("/", function (req, res, next) {
  res.render("index", { title: "index || RateMe" });
});
app.listen(process.env.PORT || 3005);
console.log("starting application.  Good job!");
