/**
 * A basic example using Express to create a simple movie recommendation engine.
 */
const express = require("express");
const session = require("express-session");
const path = require("path");
const bodyParser = require("body-parser");
import {
  clientApiKeyValidation,
  isNewSessionRequired,
  isAuthRequired,
  generateJWTToken,
  verifyToken
} from "./common/authUtils";

/**
 * Load Neode with the variables stored in `.env` and tell neode to
 * look for models in the ./models directory.
 */
const neode = require("neode")
  .fromEnv()
  .withDirectory(path.join(__dirname, "models"));

/**
 * Create a new Express instance
 */
const app = express();
/**
 * SCRF for AJAX requests used in /recommend/:genre
 */
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json());
app.use(async (req, res, next) => {
  var apiUrl = req.originalUrl;
  var httpMethod = req.method;
  req.session = {};

  if (isNewSessionRequired(httpMethod, apiUrl)) {
    req.newSessionRequired = true;
  } else if (isAuthRequired(httpMethod, apiUrl)) {
    let authHeader = req.header("Authorization");
    if(!authHeader){
      return res.status(401).send({
        ok: false,
        error: {
          reason: "No Authorization Header",
          code: 401
        }
      });
    }
    let sessionID = authHeader.split(" ")[1];
    if (sessionID) {
      let userData = verifyToken(sessionID);
      if (userData) {
        req.session.userData = userData;
        req.session.sessionID = sessionID;
      } else {
        return res.status(401).send({
          ok: false,
          error: {
            reason: "Invalid Sessiontoken",
            code: 401
          }
        });
      }
    } else {
      return res.status(401).send({
        ok: false,
        error: {
          reason: "Missing Sessiontoken",
          code: 401
        }
      });
    }
  }
  next();
});
/**
 * Set up a simple Session
 */
app.use(
  session({
    genid: function() {
      return require("uuid").v4();
    },
    resave: false,
    saveUninitialized: true,
    secret: "neoderocks"
  })
);

/**
 * Serve anything inside the ./public folder as a static resource
 */
app.use(express.static("public"));
/**
 * For examples of how to use Neode to quickly generate a REST API,
 * checkout the route examples in ./routes.api.js
 */
const apiRoutes = require("./routes/api")(neode);
const seederRoutes = require("./routes/seeders")(neode);
const sessionRoutes = require("./routes/session")(neode);

app.use("/api", apiRoutes);
app.use("/seeder", seederRoutes);
app.use("/session", sessionRoutes);

/**
 * Listen for requests on port 3000
 */
app.use((req, res, next) => {
  if (!res.data) {
    return res.status(404).send({
      status: false,
      error: {
        reason: "Invalid Endpoint",
        code: 404
      }
    });
  }
  if (req.newSessionRequired && req.session.userData) {
    try {
      res.setHeader("session-token", generateJWTToken(req.session.userData));
      res.data["session-token"] = generateJWTToken(req.session.userData);
    } catch (e) {
      console.log("e:", e);
    }
  }

  if (req.session && req.session.sessionID) {
    try {
      res.setHeader("session-token", req.session.sessionID);
      res.data["session-token"] = req.session.sessionID;
    } catch (e) {
      console.log("Error ->:", e);
    }
  }
  res.status(res.statusCode || 200).send({ status: true, response: res.data });
});

app.listen(3000, function() {
  console.log("app listening on http://localhost:3000"); // eslint-disable-line no-console
});

module.exports = app;
