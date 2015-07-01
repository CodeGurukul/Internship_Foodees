var User = require('../models/User');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy=require('passport-google-oauth').OAuth2Strategy;
var TwitterStrategy=require('passport-twitter').Strategy;

var facebook={
clientID:'376644559201250',
clientSecret:'2b03049987f434a410c1df296ae2e3e6',
callbackURL:'/auth/facebook/callback',
passReqToCallback:true
};


var google={
clientID:'535379061302-5d5oca06vtl9g09rltpflmkgv34thgop.apps.googleusercontent.com',
clientSecret:'MsdYCoCnGcZXWyftJJ8ZCgD6',
callbackURL:'/auth/google/callback',
};



var twitter= {

    consumerKey: 'idLAHc7shIYEb1WWd56o8r2m9',
    consumerSecret: '8sE8jc6b4LIQwMqGsV25IiNUagboDLTdp8drB1yQAFP8Sf18Hr',
    callbackURL: "http://127.0.0.1:3000/auth/twitter/callback"

};











//When passport is created, this says what as to be stored with regards to the user





passport.serializeUser(function(user, done) {
  done(null, user.id);
});

//Invoked by passport.session
passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

/**
 * Sign in using Email and Password.
 */
passport.use(new LocalStrategy({ usernameField:'email'},(function(email, password, done) {
  email = email.toLowerCase();
  User.findOne({ email: email }, function(err, user) {
    if (!user) return done(null, false, { message: 'Email ' + email + ' not found'});
    user.comparePassword(password, function(err, isMatch) {
      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Invalid email or password.' });
      }
    });
  });
})));




// Facebook singin


/**
 * Sign in with Facebook.
 */
passport.use(new FacebookStrategy(facebook, function(req, accessToken, refreshToken, profile, done) {
  if (req.user) {


    User.findOne({ facebook: profile.id }, function(err, existingUser) {
    
      if (existingUser) {
        console.log('There is already a Facebook account that belongs to you. Sign in with that account or delete it, then link it with your current account.' );
        done(err);
      } else {
    
        User.findById(req.user.id, function(err, user) {

          user.facebook = profile.id;
          user.tokens.push({ kind: 'facebook', accessToken: accessToken });
          user.profile.name = user.profile.name || profile.displayName;
          user.profile.gender = user.profile.gender || profile._json.gender;
          user.profile.picture = user.profile.picture || 'https://graph.facebook.com/' + profile.id + '/picture?type=large';
          user.save(function(err) {
            console.log('Facebook account has been linked.');
            done(err, user);
          });
        });
      }
    });
  } else {
    
    User.findOne({ facebook: profile.id }, function(err, existingUser) {
      if (existingUser) return done(null, existingUser);
      User.findOne({ email: profile._json.email }, function(err, existingEmailUser) {
        if (existingEmailUser) {
           console.log('There is already an account using this email address. Sign in to that account and link it with Facebook manually from Account Settings.' );
          done(err);
        } else {
          
          var user = new User();
          user.email = profile._json.email;
          user.facebook = profile.id;
          user.tokens.push({ kind: 'facebook', accessToken: accessToken });
          user.profile.name = profile.displayName;
          user.profile.gender = profile._json.gender;
          user.profile.picture = 'https://graph.facebook.com/' + profile.id + '/picture?type=small';
          user.profile.location = (profile._json.location) ? profile._json.location.name : '';
          user.save(function(err) {
            done(err, user);
          });
        }
      });
    });
  }
}));

passport.use(new GoogleStrategy(google, function(req, accessToken, refreshToken, profile, done) {
  if (req.user) {
    console.log("First Block");
    User.findOne({ google: profile.id }, function(err, existingUser) {
      if (existingUser) {
        console.log('There is already a Google+ account that belongs to you. Sign in with that account or delete it, then link it with your current account.' );
        done(err);
      } else {
        User.findById(req.user.id, function(err, user) {
         
          user.google = profile.id;
          user.tokens.push({ kind: 'google', accessToken: accessToken });
          //user.profile.picture = user.profile.picture || 'https://graph.facebook.com/' + profile.id + '/picture?type=large';
          user.profile.gender = user.profile.gender || profile._json.gender;
          user.profile.name = user.profile.displayName || profile.displayName;
          user.email = profile.emails[0].value;
          user.save(function(err) {
            console.log('Google account has been linked.');
            done(err, user);
          });
        });
      }
    });
  } else {
    
    User.findOne({ google: profile.id }, function(err, existingUser) {
      if (existingUser) return done(null, existingUser);
      User.findOne({ email: profile._json.email }, function(err, existingEmailUser) {
        if (existingEmailUser) {
          
           console.log('There is already an account using this email address. Sign in to that account and link it with Google manually from Account Settings.' );
          done(err);
        } else {
          console.log('Third block');

          console.log(profile);
          var user = new User();
          user.email = profile.emails[0].value;
          user.profile.name = user.profile.displayName || profile.displayName;
          user.google = profile.id;
          user.tokens.push({ kind: 'google', accessToken: accessToken });
          user.profile.picture = profile.photos[0].value;    
          user.profile.gender = profile._json.gender;
          user.save(function(err) {
            done(err, user);
          });
        }
      });
    });
  }
}));

passport.use(new TwitterStrategy(twitter, function( req ,token, tokenSecret, profile, done) {
  if (req.user) {


    User.findOne({ twitter: profile.id }, function(err, existingUser) {
    
      if (existingUser) {
        console.log('There is already a Twitter account that belongs to you. Sign in with that account or delete it, then link it with your current account.' );
        done(err);
      } else {
        console.log(profile);    
        User.findById(req.user.id, function(err, user) {

          user.twitter = profile.id;
          user.tokens.push({ kind: 'twitter', token: token });
          user.profile.name = user.profile.name || profile.displayName;
          user.profile.gender = user.profile.gender || profile._json.gender;
           user.profile.picture = profile.photos[0].value;    
          user.save(function(err) {
            console.log('Twitter account has been linked.');
            done(err, user);
          });
        });
      }
    });
  } else {
    
    User.findOne({ twitter: profile.id }, function(err, existingUser) {
      if (existingUser) return done(null, existingUser);
      User.findOne({ email: profile._json.email }, function(err, existingEmailUser) {
        if (existingEmailUser) {
           console.log('There is already an account using this email address. Sign in to that account and link it with Facebook manually from Account Settings.' );
          done(err);
        } else {
          
          var user = new User();
          user.email = profile._json.email;
          user.twitter = profile.id;
          user.tokens.push({ kind: 'twitter', token: token });
          user.profile.name = profile.displayName;
          user.profile.gender = profile._json.gender;
           user.profile.picture = profile.photos[0].value;    
          user.profile.location = (profile._json.location) ? profile._json.location.name : '';
          user.save(function(err) {
            done(err, user);
          });
        }
      });
    });
  }
}));


/**
 * Login Required middleware.
 */
exports.isAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/');
};







