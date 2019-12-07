import { verifyToken } from "../common/authUtils";

module.exports = function(neode) {
  const router = require("express").Router();
  const { check, validationResult } = require("express-validator");
  const bcrypt = require("bcrypt");
  router.get("/users", (req, res) => {
    neode
      .all("User")
      .then(res2 => {
        return res2.toJson();
      })
      .then(json => {
        res.send(json);
      })
      .catch(e => {
        res.status(500).send(e.stack);
      });
  }),
    router.get("/daytypes", (req, res) => {
      neode
        .all("DayType")
        .then(res2 => {
          return res2.toJson();
        })
        .then(json => {
          res.send(json);
        })
        .catch(e => {
          res.status(500).send(e.stack);
        });
    }),
    router.get("/workers", (req, res) => {
      let userData = verifyToken(req.header("Authorization").split(" ")[1]);
      neode
        .cypher(
          "MATCH (u:User {id: {id}})<-[:TAKE_CARE_OF]-(p)-[:WORKS_AT]-(w)-[:DOES]-(n) RETURN w,n",
          userData
        )
        .then(res => {
          return Promise.all([
            neode.hydrate(res, "w").toJson(),
            neode.hydrate(res, "n").toJson()
          ]).then(([w, n]) => {
            return { w, n };
          });
        })
        .then(json => {
          let data = [];
          json.w.forEach((worker, index) => {
            data.push({
              worker: worker,
              role: json.n[index]
            });
          });
          res.send(data);
        })
        .catch(e => {
          res.status(500).send(e.stack);
        });
    }),
    router.post(
      "/worker",
      [
        check("name").exists(),
        check("lastname").exists(),
        check("ranch_id").exists(),
        check("rol_id").exists()
      ],
      (req, res) => {
        neode
          .create("Worker", {
            name: req.body.name,
            lastname: req.body.lastname
          })
          .then(worker => {
            neode.first("Ranch", { id: req.body.ranch_id }).then(ranch => {
              worker.relateTo(ranch, "ranch");
            });
            neode.first("WorkerRole", { id: req.body.rol_id }).then(role => {
              worker.relateTo(role, "role");
            });
            return worker.toJson();
          })
          .then(json => {
            res.send(json);
          })
          .catch(e => {
            res.status(500).send(e.stack);
          });
      }
    ),
    router.post(
      "/attendance",
      [
        check("crop_id").exists(),
        check("date").exists(),
        check("workers").exists()
      ],
      (req, res) => {
        let date = new Date(req.body.date);
        neode
          .create("Attendance", {
            date: date
          })
          .then(attendance => {
            neode.first("Crop", { id: req.body.crop_id }).then(crop => {
              attendance.relateTo(crop, "crop");
            });
            req.body.workers.forEach(worker => {
              neode.first("Worker", { id: worker.worker.id }).then(workerNeo => {
                attendance.relateTo(workerNeo, "worker_id", {
                  payment: worker.rol.payment.id,
                  daytype: worker.daytype
                });
              });
            });
            return attendance.toJson();
          })
          .then(json => {
            res.send(json);
          })
          .catch(e => {
            res.status(500).send(e.stack);
          });
      }
      //   neode
      //     .create("Worker", {
      //       name: req.body.name,
      //       lastname: req.body.lastname
      //     })
      //     .then(worker => {
      //       neode.first("Ranch", { id: req.body.ranch_id }).then(ranch => {
      //         worker.relateTo(ranch, "ranch");
      //       });
      //       neode.first("WorkerRole", { id: req.body.rol_id }).then(role => {
      //         worker.relateTo(role, "role");
      //       });
      //       return worker.toJson();
      //     })
      //     .then(json => {
      //       res.send(json);
      //     })
      //     .catch(e => {
      //       res.status(500).send(e.stack);
      //     });
      // }
    ),
    router.post(
      "/crop",
      [
        check("crop_type").exists(),
        check("end_date").exists(),
        check("init_date").exists(),
        check("ranch_id").exists()
      ],
      (req, res) => {
        let init_date = new Date(req.body.init_date);
        let end_date = new Date(req.body.end_date);
        neode
          .create("Crop", {
            init_date: init_date,
            end_date: end_date
          })
          .then(crop => {
            neode.first("Ranch", { id: req.body.ranch_id }).then(ranch => {
              crop.relateTo(ranch, "ranch");
            });
            neode
              .first("CropType", { id: req.body.crop_type })
              .then(croptype => {
                crop.relateTo(croptype, "crop_type");
              });
            return crop.toJson();
          })
          .then(json => {
            res.send(json);
          })
          .catch(e => {
            res.status(500).send(e.stack);
          });
      }
    ),
    router.post(
      "/harvest",
      [
        check("date").exists(),
        check("amount").exists(),
        check("crop").exists()
      ],
      (req, res) => {
        let date = new Date(req.body.date);
        neode
          .create("Harvest", {
            date: date,
            amount: req.body.amount
          })
          .then(harvest => {
            neode.first("Ranch", { id: req.body.ranch_id }).then(ranch => {
              harvest.relateTo(ranch, "ranch");
            });
            neode.first("Crop", { id: req.body.crop }).then(crop => {
              harvest.relateTo(crop, "crop");
            });
            return harvest.toJson();
          })
          .then(json => {
            res.send(json);
          })
          .catch(e => {
            res.status(500).send(e.stack);
          });
      }
    ),
    router.get("/size_type", (req, res) => {
      neode
        .all("SizeType")
        .then(res2 => {
          return res2.toJson();
        })
        .then(json => {
          res.send(json);
        })
        .catch(e => {
          res.status(500).send(e.stack);
        });
    }),
    router.get("/crop_type", (req, res) => {
      neode
        .all("CropType")
        .then(res2 => {
          return res2.toJson();
        })
        .then(json => {
          res.send(json);
        })
        .catch(e => {
          res.status(500).send(e.stack);
        });
    }),
    router.get("/crop", (req, res) => {
      let userData = verifyToken(req.header("Authorization").split(" ")[1]);
      neode
        .cypher(
          "MATCH (u:User {id: {id}})<-[:TAKE_CARE_OF]-(p)-[:AT]-(w)-[:OF]-(n) RETURN w,n",
          userData
        )
        .then(res => {
          return Promise.all([
            neode.hydrate(res, "w").toJson(),
            neode.hydrate(res, "n").toJson()
          ]).then(([w, n]) => {
            return { w, n };
          });
        })
        .then(res2 => {
          let data = [];
          res2.w.forEach((crop, index) => {
            crop.type = res2.n[index];
            data.push(crop);
          });
          res.send(data);
        })
        .catch(e => {
          res.status(500).send(e.stack);
        });
    }),
    router.get("/harvest", (req, res) => {
      let userData = verifyToken(req.header("Authorization").split(" ")[1]);
      neode
        .cypher(
          "MATCH (u:User {id: {id}})<-[:TAKE_CARE_OF]-(p)-[:AT]-(w)-[:ON]-(n) RETURN w,n",
          userData
        )
        .then(res => {
          return Promise.all([
            neode.hydrate(res, "w").toJson(),
            neode.hydrate(res, "n").toJson()
          ]).then(([w, n]) => {
            return { w, n };
          });
        })
        .then(res2 => {
          let data = [];
          console.log(res2);
          res2.w.forEach((harvest, index) => {
            harvest.crop = res2.n[index];
            data.push(harvest);
          });
          console.log(data);
          res.send(data);
        })
        .catch(e => {
          res.status(500).send(e.stack);
        });
    }),
    router.get("/roles", (req, res) => {
      let userData = verifyToken(req.header("Authorization").split(" ")[1]);
      neode
        .all("WorkerRole")
        .then(res2 => {
          return res2.toJson();
        })
        .then(json => {
          neode
            .cypher(
              "MATCH (u:User {id: {id}})<-[:TAKE_CARE_OF]-(p)-[:AT]-(w)-[:GET_PAID]-(n) RETURN w,n ORDER BY w.init_date",
              userData
            )
            .then(res => {
              return Promise.all([
                neode.hydrate(res, "w").toJson(),
                neode.hydrate(res, "n").toJson()
              ]).then(([w, n]) => {
                return { w, n };
              });
            })
            .then(res2 => {
              json.forEach(rol => {
                rol.payment = [];
                res2.n.forEach((rolPmnt, indexPmnt) => {
                  if (rol.id == rolPmnt.id) {
                    rol.payment.push(res2.w[indexPmnt]);
                  }
                });
                rol.payment = rol.payment.slice(-1)[0];
              });
              res.send(json);
            })
            .catch(e => {
              res.status(500).send(e.stack);
            });
        })
        .catch(e => {
          res.status(500).send(e.stack);
        });
    }),
    router.post(
      "/add_payment_role/:id",
      [check("role").exists(), check("ranch_id").exists()],
      (req, res) => {
        let currentdate = new Date();
        neode
          .create("RolePayment", {
            wage: req.body.role.cantidad,
            init_date: currentdate
          })
          .then(rolePmnt => {
            neode.first("WorkerRole", { id: req.body.role.id }).then(role => {
              rolePmnt.relateTo(role, "role");
            });
            neode.first("Ranch", { id: req.body.ranch_id }).then(ranch => {
              rolePmnt.relateTo(ranch, "ranch");
            });
            return rolePmnt.toJson();
          })
          .then(json => {
            res.send(json);
          })
          .catch(e => {
            res.status(500).send(e.stack);
          });
      }
    ),
    router.post(
      "/user",
      [
        check("name").exists(),
        check("lastname").exists(),
        check("email").isEmail(),
        check("password").exists()
      ],
      (req, res) => {
        bcrypt.hash(req.body.password, 10, function(err, hash) {
          if (err) {
            res.status(500).send(err);
          }
          neode
            .create("User", {
              name: req.body.name,
              lastname: req.body.lastname,
              email: req.body.email,
              password: hash
            })
            .then(user => {
              neode.first("UserRole", { name: req.body.role }).then(role => {
                user.relateTo(role, "role");
              });
              return user.toJson();
            })
            .then(json => {
              neode
                .cypher("CALL dbms.security.createUser({id}, {password});", {
                  id: json.id,
                  password: hash
                })
                .then(() => {
                  neode.cypher(
                    "CALL dbms.security.addRoleToUser({role}, {id});",
                    { id: json.id, role: req.body.role.toLowerCase() }
                  );
                });
              res.send(json);
            })
            .catch(e => {
              res.status(500).send(e.stack);
            });
        });
      }
    ),
    router.post(
      "/ranch",
      [
        check("address").exists(),
        check("name").exists(),
        check("size").isEmail(),
        check("sizetype").exists()
      ],
      (req, res) => {
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
          neode
            .create("Ranch", {
              name: req.body.name,
              address: req.body.address,
              size: req.body.size,
              zipcode: req.body.zipcode,
              email: req.body.email
            })
            .then(ranch => {
              neode.find("SizeType", req.body.sizetype).then(res => {
                ranch.relateTo(res, "size_type", { size: req.body.size });
              });
              neode.find("User", userData.id).then(res => {
                res.relateTo(ranch, "ranch");
              });
              return ranch.toJson();
            })
            .then(json => {
              res.send(json);
            })
            .catch(e => {
              res.status(500).send(e.stack);
            });
        }
      }
    );
  return router;
};
