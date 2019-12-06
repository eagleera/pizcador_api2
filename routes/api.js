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
    router.get("/workers/:ranch_id", (req, res) => {
      let ranch_id = {
        ranch_id: req.params.ranch_id
      }
      neode
        .cypher("MATCH (:Ranch {id:{ranch_id}})-[:WORKS_AT]-(w)-[:DOES]-(n) RETURN w, n",
        ranch_id)
        .then(res => {
          return Promise.all([
            neode.hydrate(res, "w").toJson(),
            neode.hydrate(res, "n").toJson()
          ]).then(([w, n]) => {
            return { w, n };
          });
        })
        .then(json => {
          console.log(json);
          let data = [];
          json.w.forEach((worker, index) => {
            data.push({
              worker: worker,
              role: json.n[index]
            });
          });
          console.log(data);
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
            neode.first("CropType", { id: req.body.crop_type }).then(croptype => {
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
      neode
        .all("Crop")
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
    router.get("/roles", (req, res) => {
      neode
        .all("WorkerRole")
        .then(res2 => {
          return res2.toJson();
        })
        .then(json => {
          console.log(json);
          neode
            .cypher(
              "MATCH (w:RolePayment)<-[:GET_PAID]-(n) RETURN w, n ORDER BY w.init_date"
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
              console.log(json);
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
              console.log(userData);
              neode.find("SizeType", req.body.sizetype).then(res => {
                ranch.relateTo(res, "size_type", { size: req.body.size });
              });
              neode.find("User", userData.id).then(res => {
                res.relateTo(ranch, "ranch");
                console.log(res);
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
    ),
    router.get("/movies", (req, res) => {
      const order_by = req.query.order || "title";
      const sort = req.query.sort || "ASC";
      const limit = req.query.limit || 10;
      const page = req.query.page || 1;
      const skip = (page - 1) * limit;

      const params = {};
      const order = { [order_by]: sort };

      neode
        .all("Movie", params, order, limit, skip)
        .then(res => {
          /*
           *`all` returns a NodeCollection - this has a toJson method that
           * will convert all Nodes within the collection into a JSON object
           */
          return res.toJson();
        })
        .then(json => {
          res.send(json);
        })
        .catch(e => {
          res.status(500).send(e.stack);
        });
    });

  /**
   * Use `findById` to get a movie by it's internal Node ID.
   *
   * Node: this isn't recommended as a long term solution as
   * Neo4j may reassign internal ID's
   */
  router.get("/movies/~:id", (req, res) => {
    neode
      .findById("Movie", parseInt(req.params.id))
      .then(res => {
        return res.toJson();
      })
      .then(json => {
        res.send(json);
      })
      .catch(e => {
        res.status(500).send(e.stack);
      });
  });

  /**
   * Use `find` to get a movie by it's primary key.  The primary key
   * is defined in the Model definition by adding the
   * `"primary":true` key.
   */
  router.get("/movies/:id", (req, res) => {
    neode
      .find("Movie", req.params.id)
      .then(res => {
        return res.toJson();
      })
      .then(json => {
        res.send(json);
      })
      .catch(e => {
        res.status(500).send(e.stack);
      });
  });

  /**
   * Run a more complex cypher query based on two parameter inputs.
   *
   * Find actors in common between two movies
   */
  router.get("/movies/:a_id/common/:b_id", (req, res) => {
    neode
      .cypher(
        "MATCH (a:Movie {id:{a_id}})<-[:DIRECTED]-(actor)-[:DIRECTED]->(b:Movie {id: {b_id}}) return a, b, actor",
        req.params
      )
      .then(res => {
        return Promise.all([
          neode.hydrateFirst(res, "a").toJson(),
          neode.hydrateFirst(res, "b").toJson(),

          /**
           * The `.hydrate()` function will return a `NodeCollection`
           * containing all Nodes from the resultset that have this alias
           */
          neode.hydrate(res, "actor").toJson()
        ]).then(([a, b, actors]) => {
          // Format into a friendly object
          return { a, b, actors };
        });
      })
      .then(json => {
        // Return a JSON response
        res.send(json);
      })
      .catch(e => {
        res.status(500).send(e.stack);
      });
  });
  return router;
};
