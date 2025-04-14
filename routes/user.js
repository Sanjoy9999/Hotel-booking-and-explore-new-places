const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");
const userController = require("../controllers/user");

//sign up the user
router
  .route("/signup")
  .get(userController.renderNewSignupForm) //render the signup form
  .post(wrapAsync(userController.signup)); //sign up the user

//log in the user
router
  .route("/login")
  .get(userController.renderLoginForm) //render the login form
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userController.login
  ); //log in the user

//log out the user
router.get("/logout", userController.logout);

module.exports = router;
