var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var secret = require('../secret/secret');

const Customer = require('../models/Customer.js');
console.log(Customer);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});
passport.deserializeUser((id, done) => {
    Customer.findById(id, (err, user) => {
        done(err, user);
    });
});

passport.use('local.signup', new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    (req, username, password, done) => {
        console.log("Inside Local.signup" + "  First name " + req.body.firstname + "  Customername " + username + "  Password " + password);

        Customer.findOne({ email: username }, (err, user) => {
            console.log("Inside Local.signup1");
            if (err) {
                return done(err);
            }
            if (user) {
                console.log("User already exists");
                return done(null, false, req.flash('errors', 'user with email alreay exist'));
            }
            var newUser = new Customer();
            console.log("Inside Local.signup2");
            newUser.firstname = req.body.firstname;
            newUser.email = username;
            newUser.password = newUser.encryptPassword(password);
            newUser.mobilenumber=req.body.mobilenumber;
            newUser.lastname=req.body.lastname;
            //newUser.save((err) => {

            //     return (done(null), newUser);
            // });
            Customer.create({
                firstname: newUser.firstname,
                email: newUser.email,
                password: newUser.password,
                mobilenumber:newUser.mobilenumber,
                lastname:newUser.lastname
            })
                .then(user => {
                    console.log("Inserted user");
                    return (done(null, newUser));
                });

        })
    }))
console.log('passport working');


passport.use('local.login', new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    (req, username, password, done) => {
        console.log("Inside Local.login" + "Username " + username + "  Password " + password);

    Customer.findOne({ email: username }, (err, user) => {
            console.log("Inside Local.login1");
            if (err) {
                return done(err);
            };
            var message = [];
            if (user) {
                message.push("Valid user id");
                // console.log("User exists"+user);
                if (user.validPassword(password)) {
                    console.log("Checking password");
                    return done(null, user, req.flash('success', message));
                }
                else {
                    message.push("Invalid user id");
                    return done(null, false, req.flash('error', message));
                }

            };
        });
    }
));

passport.use(new FacebookStrategy(secret.facebook, (req, token, refreshtoken, profile, done) => {
    console.log("Facebook secret worked");
    Customer.findOne({ facebook: profile.id }, (err, user) => {
        if (err) {
            console.log("Facebook secret error");
            return done(err);
        }
        if (user) {
            console.log("Facebook user found");
            return done(null, user);
        } else {
            console.log("Facebook new user");
            var newUser = new Customer();
            newUser.facebook = profile.id;
            newUser.fullname = profile.displayName;
            newUser.email = profile._json.email;
            newUser.tokens.push({ token: token });
            newUser.save((err) => {
                console.log("Facebook new user created");
                return done(null, newUser);
            })
        }
    })
}));