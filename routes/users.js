const express        = require("express");
const router         = express.Router();
const bcrypt         = require("bcrypt");
const bcryptSalt     = 10;
const ensureLogin    = require("connect-ensure-login");
const passport       = require("passport");
const User           = require('../models/User');

//LOG OUT ROUTE
router.get("/logout", (req, res) => {  
    req.logout();
    req.session.destroy();
    res.redirect('/');
});

//SIGN UP GET ROUTE
router.get('/signup', (req, res) => {
  res.render('users/newUser');
});

//SIGN UP POST ROUTE
router.post("/signup", (req, res, next) => {
const username = req.body.username;
const password = req.body.password;

    if (username === "" || password === "") {
      res.render("users/newUser", { message: "Indicate username and password" });
      return;
    }

    User.findOne({ username })
      .then(user => {
         if (user !== null) {
           res.render("users/newUser", { message: "The username already exists" });
           return;
       }

  const salt = bcrypt.genSaltSync(bcryptSalt);
  const hashPass = bcrypt.hashSync(password, salt);

    const newUser = new User({
      username,
      password: hashPass,
    });

      newUser.save((err) => {
        if (err) {
          res.render("users/newUser", { message: "Something went wrong" });
        } else {
          res.redirect("/");
        }
      });
  })
    .catch(error => {
      next(error);
    });
});

//LOG IN GET ROUTE
router.get("/login", (req, res, next) => {
  res.render("users/login", { "message": req.flash("error") });
});

//LOG IN POST ROUTE
router.post("/login", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login",
  failureFlash: true,
  passReqToCallback: true
  })
);

//User Profile 
router.get('/:id', (req, res, next) => {

  let userId = req.params.id;
    if (!userId) { 
      return res.status(404).render('not-found');
    }
   User.findById(userId)
     .then(user => {
            if (!user) {
              return res.status(404).render('not-found');
            }
        res.render("users/profile", user);
      })
    .catch(next);
});

//GET ROUTE FOR USER PROFILE EDITING
router.get('/:id/edit', (req, res, next) => {
      let userId = req.params.id;
      User.findById(userId)
       .then(user => {
          if (!user) {
            return res.status(404).render('not-found');
        }
    res.render("users/editUser", user);
  })
  .catch((error) => {
    console.log(error);
  });
});

//POST ROUTE FOR USER PROFILE EDITING
router.post('/:id/edit', (req, res, next) => {

     let userId = req.params.id;
     const { username, password } = req.body;
 
        User.update({_id: userId}, { $set: { username, password }},{new: true})
         .then((e) => {
              res.redirect('/');
         })
          .catch((error) => {
            console.log(error);
          });
});

//TYPE OF USER CHECKING FUNCTION, NOT YET APPLIED
function checkRoles(role) {
  return function(req, res, next) {
    if (req.isAuthenticated() && req.user.role === role) {
      return next();
    } else {
      res.redirect('/login');
    }
  };
}

//DELETING USER/ACCOUNT ROUTE
router.post('/:id/delete', (req, res, next) => {

  let userId = req.params.id;
  User.findByIdAndRemove(userId)
    .then(user => {
      if (!user) {
        return res.status(404).render('not-found');
    }
      console.log('Deleting succes!!');
      res.redirect('/');
    })
    .catch(next);
});
  

module.exports = router;