import * as passport from "passport";
import * as local from "passport-local";
import { Entry, EntryType } from "../../schemas/entry";
import { IEntryMapModel } from "../../schemas/entryMap";

passport.serializeUser((user, done) => {
    return done(null, user);
});

passport.deserializeUser((user, done) => {
    return done(null, user);
});

passport.use("local", new local.Strategy((username, password, done) => {
    Entry.findById(username).then((entry) => {
        if (!entry) { return done(null, false); }
        if (entry.type !== EntryType.user) { return done(null, false); }
        if (!entry.validPassword(password)) { return done(null, false); }
        return done(null, username);
    }).catch((err) => done(err));
}));
