import * as passport from "passport";
import * as local from "passport-local";
import { IUserModel, User } from "./schemas/user";

passport.serializeUser((user: IUserModel, done) => {
    done(null, user._id);
});

passport.deserializeUser((id: string, done) => {
    User.findById(id)
        .then((user) => done(null, user))
        .catch((err) => done(err, null));
});

passport.use("local.register", new local.Strategy({ passReqToCallback: true }, (req, username, password, done) => {
    req.checkBody("username", "Invalid username").notEmpty();
    req.checkBody("password", "Invalid password").notEmpty();
    const errors = req.validationErrors();
    if (errors) {
        return done(null, false, req.fl);
    }
}));
