import { getUserDetails, updateUserPassword } from "../services/UserService";
import bcrypt from "bcrypt";
import { verifyToken } from "../common/authUtils";

module.exports = function(neode) {
  const router = require("express").Router();
  router.post("/login", async (req, res, next) => {
    let email = req.body.email;
    let pwd = req.body.password;
    let userDetails = await getUserDetails(neode, email);
    if (userDetails) {
      let { password } = userDetails;
      bcrypt.compare(pwd, password, function(err, success) {
        if (success) {
          res.data = userDetails;
          req.session.userData = userDetails;
          next();
        } else {
          res.statusCode = 400;
          res.data = {
            status: false,
            error: "Invalid Password"
          };
          next();
        }
      });
    } else {
      res.statusCode = 400;
      res.data = {
        status: false,
        error: "Invalid Username"
      };
      next();
    }
  }),
    router.get("/me", async (req, res, next) => {
      let authHeader = req.header("Authorization");
      if (!authHeader) {
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
        res.data = userData;
        let user_id = {
          user_id: userData.id
        };
        neode
          .cypher(
            "MATCH (u:User {id:{user_id}})<-[:TAKE_CARE_OF]-(n) RETURN u, n",
            user_id
          )
          .then(res => {
            return Promise.all([
              /**
               * .hydrateFirst can be called to get the record with
               * the alias provided in the first row, then return
               * this object wrapped in a `Node` instance
               */
              neode.hydrateFirst(res, "u").toJson(),
              neode.hydrateFirst(res, "n").toJson()
            ]).then(([u, n]) => {
              // Format into a friendly object
              return { u, n };
            });
          })
          .then(json => {
            if (json.n) {
              res.data.ranch = json.n;
            } else {
              res.data.ranch = null;
            }
            next();
          })
          .catch(e => {
            res.status(500).send(e.stack);
          });
      }
    }),
    router.put("/password", async (req, res, next) => {
      try {
        let oldPwd = req.body.old_password;
        let newPwd = req.body.new_password;
        if (!oldPwd && !newPwd) {
          res.statusCode = 400;
          res.data = {
            status: false,
            error: "Invalid Parameters"
          };
        }
        let uname = req.session.userData.username;
        let userDetails = await getUserDetails(req.db, uname);
        if (oldPwd !== userDetails.password) {
          res.statusCode = 400;
          res.data = {
            status: false,
            error: "Old Password doesn't match"
          };
        } else {
          let updateRes = await updateUserPassword(req.db, uname, newPwd);
          res.data = { message: "Password updated successfully" };
        }
        next();
      } catch (e) {
        next(e);
      }
    });
  return router;
};
