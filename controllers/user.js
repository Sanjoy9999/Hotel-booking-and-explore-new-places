const User = require("../models/user");

module.exports.renderNewSignupForm = (req, res) => {
  res.render("users/signup");
};

// This function is used to create a new user
module.exports.signup = async (req, res) => {
  try {
    let { email, username, password } = req.body;
    if (!email || !username || !password) {
      req.flash("error", "All fields are required");
      return res.redirect("/signup");
    }
    if (password.length < 6) {
      req.flash("error", "Password must be at least 6 characters long");
      return res.redirect("/signup");
    }
    if (email.indexOf("@") === -1) {
      req.flash("error", "Invalid email");
      return res.redirect("/signup");
    }
    let user = new User({ email, username });

    let registeredUser = await User.register(user, password);
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", `Welcome ${registeredUser.username} to Wonder Lust`);
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login");
};

module.exports.login = async (req, res) => {
  req.flash("success", "Welcome back to Wonder Lust");
  res.redirect(res.locals.redirectUrl || "/listings");
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err); // Pass error to Express error handler
    }
    req.flash("success", "Thank you for visiting Wonder Lust");
    res.redirect("/listings"); // Only redirect if no error
  });
};
