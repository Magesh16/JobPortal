const { body, validationResult } = require("express-validator");

var nodemailer = require("nodemailer");
var smtpTransport = require("nodemailer-smtp-transport");
var async = require("async");
var crypto = require("crypto");

var secret = require('../secret/secret');

var User = require('../models/Userschema');
const { callbackPromise } = require("nodemailer/lib/shared");
const { getMaxListeners } = require("../models/Userschema");
const { response } = require("express");
const { reset } = require("nodemon");
const { title } = require("process");


module.exports = (app, passport) => {
  app.get("/", function (req, res, next) {
    if (req.session.cookie.originalMaxAge != null) {
      res.redirect('/home');
    } else {
      res.render("index", { title: "index || RateMe" });
    }

  });

  app.get("/signup", function (req, res) {
    var errors = req.flash("errors");
    console.log("Signup get called");
    res.render("user/signup", { title: "signup || RateMe" });
  });

  app.post(
    "/signup",
    [body("fullname").isAlphanumeric(), body("email").isEmail(), body("password").isLength({ min: 5 })],
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        //return res.status(422).json({ errors: errors.array() });
        console.log(errors.array());
        return res
          .status(422)
          .render("user/signup", {
            title: "signup Again || RateMe",
            errors: errors.array()
          });
      }
      next();
    },
    passport.authenticate("local.signup", {
      successRedirect: "/login",
      failureRedirect: "/signup",
      failureFlash: true,
    })
    // passport.authenticate("local.signup", (err, user, next) => {
    //     console.log(user);
    //     return res.status(422).json({ user:user.fullname });
    // })
  );


  app.get("/login", function (req, res) {
    var errors = req.flash("errors");
    console.log("login get called");
    res.render("user/login", { title: "login || RateMe", });
  });

  app.get("/home", function (req, res, next) {
    res.render("home", { title: "Home || RateMe" });

  });

  app.get("/forgot", function (req, res, next) {
    var errors = req.flash("errors");
    var info = req.flash('info');

    res.render("user/forgot", { title: "Request Password Reset", errors: errors, info: info });
  });

  app.post("/forgot", function (req, res, next) {
    async.waterfall([
      function (callBack) {
        crypto.randomBytes(20, (err, buf) => {
          var rand = buf.toString('hex');
          callBack(err, rand);
        });
      },
      function (rand, callBack) {
        User.findOne({ email: req.body.email }, function (err, user) {
          if (!user) {
            req.flash("errors", "Invalid email or No Account with this Email exist");
            return res.redirect('/forgot');
          }

          user.passwordResetToken = rand;
          user.passwordResetExpires = Date.now() + 60 * 60 * 1000;

          user.save((err) => {
            callBack(err, rand, user)
          });
        })
      },
      function (rand, user, callBack) {
        var smtpTransport = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
            user: secret.auth.user,
            pass: secret.auth.pass
          },
          tls: {
            rejectUnauthorized: false
          }
        });

        var mailOptions = {
          to: user.email,
          from: 'RateMe' + '<' + secret.auth.user + '>',
          // from: 'RateMe < hai@gmail.com >',
          subject: "RateMe application Password reset token",
          text: "you have requested for password reset token.\n\n" +
            "please click on the link to complete the process \n\n" +
            "http://localhost:3000/reset/" + rand + "\n\n"
        };
        smtpTransport.sendMail(mailOptions, (err, response) => {
          req.flash('info', 'A Password reset token has been sent to ' + user.email);
          return (callBack(err, user));
        });
      }
    ], (err) => {
      if (err) {
        return next(err);
      }
      res.redirect('/forgot');
    })
  });

  app.get('/reset/:token', (req, res) => {
    User.findOne({ passwordResetToken: req.params.token, passwordResetExpires: { $gt: Date.now() } }, (err, user) => {
      if (!user) {
        req.flash("errors", "Password Reset Token has expired or Invalid ");
        return res.redirect('/reset/' + req.params.token);
      };
      var errors = req.flash('errors');
      var success = req.flash('success');
      res.render('user/reset', { title: "Reset Your Password", token: req.params.token, errors: errors, success: success });
    })
  });

  app.post('/reset/:token', (req, res) => {
    async.waterfall([
      function (callBack) {
        console.log(req.params.token);
        User.findOne({ passwordResetToken: req.params.token, passwordResetExpires: { $gt: Date.now() } }, (err, user) => {
          if (!user) {
            console.log("Token mismatch");
            req.flash("errors", "Password Reset Token has expired or Invalid ");
            return res.redirect('/reset/' + req.params.token);
          };
          body("password").isLength({ min: 5 });
          //body("password")==body("cpassword");
          var errors = validationResult(req);

          if (req.body.password == req.body.cpassword) {
            if (errors.length > 0) {
              // var messages = [];
              // errors.forEach((errors) => {
              // messages.push(errors.msg)
              // })
              console.log(errors);
              var errors = req.flash('errors');
              res.redirect('/reset/' + req.params.token);
            } else {
              console.log("Password reset");
              user.password = user.encryptPassword(req.body.password);
              passwordResetToken = undefined;
              passwordResetExpires = undefined;
              user.save((errors) => {
                // console.log('updated')
                req.flash(" Your Password has been successfully updated ");
                callBack(err, user);
              })
            }
          } else {
            req.flash('errors', 'Password and Confirm Password are not equal ');
            res.redirect('/reset/' + req.params.token);
          }
          //  res.render('user/reset', {title :"Reset Your Password", errors : errors});
        })
      },
      function (user, callBack) {
        var smtpTransport = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
            user: secret.auth.user,
            pass: secret.auth.pass
          },
          tls: {
            rejectUnauthorized: false
          }
        });

        var mailOptions = {
          to: user.email,
          from: 'RateMe' + '<' + secret.auth.user + '>',
          // from: 'RateMe < hai@gmail.com >',
          subject: "Your Password has been updated",
          text: "This is a confirmation that the Password has been updated " + user.email
        };
        smtpTransport.sendMail(mailOptions, (err, response) => {
          callBack(err, user);
          var errors = req.flash('errors');
          var success = req.flash('success');
          res.render('user/login', { title: "Login with new Password", errors: errors, success: success });
        });
      }




    ])
  });

  app.get('/logout', (req, res) => {
    req.logout();

    req.session.destroy((err) => {
      res.redirect('/');
    });
  });

  app.post(
    "/login",
    [body("email").isEmail(), body("password").isLength({ min: 5 })],
    (req, res, next) => {
      console.log("Login Post called" + req.body.email + req.body.password);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        //return res.status(422).json({ errors: errors.array() });
        console.log(errors.array());
        return res
          .status(422)
          .render("user/login", {
            title: "login Again || RateMe",
            errors: errors.array()
          });
      }
      console.log("Login Post called1");
      next();
    },
    passport.authenticate("local.login",
      {
        //  successRedirect: "home",
        failureRedirect: "/login",
        failureFlash: true,
      }),
    (req, res) => {
      console.log('rememberme');
      if (req.body.rememberme) {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
      } else {
        req.session.cookie.expires = null;
      }
      res.redirect('/home');
    });


  app.get('/auth/facebook', passport.authenticate('facebook'));

  app.get('/auth/facebook/callback', passport.authenticate('facebook', {
    successRedirect: "/home",
    failureRedirect: "/login",
    failureFlash: true,
  }))
};