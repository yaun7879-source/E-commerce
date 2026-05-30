const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const { getPool } = require('./db');

const BACKEND_PORT = process.env.PORT || '5001';

/**
 * Passport.js Configuration
 * Handles Google OAuth 2.0 and Facebook OAuth strategies
 */

// Serialize user into session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const pool = await getPool();
        const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);

        if (users.length === 0) {
            return done(null, false);
        }

        done(null, users[0]);
    } catch (error) {
        console.error('❌ Error deserializing user:', error);
        done(error);
    }
});

/**
 * Google OAuth 2.0 Strategy
 * Callback URL: {BACKEND_URL}/api/auth/google/callback
 * 
 * Environment variables required:
 * - GOOGLE_CLIENT_ID
 * - GOOGLE_CLIENT_SECRET
 */
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL || `http://localhost:${BACKEND_PORT}/api/auth/google/callback`,
                passReqToCallback: false
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    console.log('✅ Google OAuth profile received:', profile.id);

                    // Return the profile to be processed in the route handler
                    return done(null, profile);
                } catch (error) {
                    console.error('❌ Error in Google strategy:', error);
                    return done(error);
                }
            }
        )
    );
    console.log('✅ Google OAuth strategy configured');
} else {
    console.log('⚠️  Google OAuth credentials not set. Google login will be disabled.');
}

/**
 * Facebook OAuth Strategy
 * Callback URL: {BACKEND_URL}/api/auth/facebook/callback
 * 
 * Environment variables required:
 * - FACEBOOK_APP_ID
 * - FACEBOOK_APP_SECRET
 */
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(
        new FacebookStrategy(
            {
                clientID: process.env.FACEBOOK_APP_ID,
                clientSecret: process.env.FACEBOOK_APP_SECRET,
                callbackURL: process.env.FACEBOOK_CALLBACK_URL || `http://localhost:${BACKEND_PORT}/api/auth/facebook/callback`,
                profileFields: ['id', 'emails', 'name', 'displayName', 'photos'],
                passReqToCallback: false
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    console.log('✅ Facebook OAuth profile received:', profile.id);

                    // Return the profile to be processed in the route handler
                    return done(null, profile);
                } catch (error) {
                    console.error('❌ Error in Facebook strategy:', error);
                    return done(error);
                }
            }
        )
    );
    console.log('✅ Facebook OAuth strategy configured');
} else {
    console.log('⚠️  Facebook OAuth credentials not set. Facebook login will be disabled.');
}

module.exports = passport;
