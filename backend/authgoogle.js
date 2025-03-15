// authGoogle.js
const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./user');

const router = express.Router();

// In production, store these in .env or environment variables
const GOOGLE_CLIENT_ID = "1042138685534-6flokv8uhqnahhup4ohpo39po8r5d3t1.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";

// Configure the Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      // Must match exactly what's in Google Cloud Console's "Authorized redirect URIs"
      callbackURL: "/api/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const googleEmail = profile.emails[0].value;
        const name = profile.displayName;

        // Check if we already have a user with this googleId
        let user = await User.findOne({ googleId });
        if (!user) {
          // If no user, create one
          user = new User({
            googleId,
            googleEmail,
            name
          });
          await user.save();
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Initialize passport
router.use(passport.initialize());

// 1) Route to start Google Auth
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// 2) Callback URL after Google Auth
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login-failed' }),
  (req, res) => {
    // Successful authentication
    // Typically, you'd issue a JWT or session here
    res.send('Google sign-in successful! You can redirect to your app now.');
  }
);

module.exports = router;
