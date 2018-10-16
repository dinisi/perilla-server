import * as passport from "passport";
import * as local from "passport-local";
import { Entry } from "./schemas/entry";
import { IEntryMapModel } from "./schemas/entryMap";

passport.serializeUser((entry: IEntryMapModel, done) => {
    done(null, entry._id);
});

passport.deserializeUser((id: string, done) => {
    Entry.findById(id)
        .then((entry) => done(null, entry))
        .catch((err) => done(err, null));
});
