import { getUserDetails, updateUserPassword } from "../services/UserService";
import bcrypt from "bcrypt";
module.exports = function(neode) {
  const router = require("express").Router();
  router.post("/login", async (req, res, next) => {
    console.log("hola");
    let email = req.body.email;
    let pwd = req.body.password;
    let userDetails = await getUserDetails(neode, email);
    if (userDetails) {
      let { password } = userDetails;
      bcrypt.compare(pwd, password, function(err, success) {
        if (success) {
          console.log("se armo");
          res.data = userDetails;
          console.log(res.data);
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
