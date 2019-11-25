module.exports = function(neode) {
  const router = require("express").Router();
  const { check, validationResult } = require("express-validator");
  const bcrypt = require("bcrypt");
  router.get("/api/users", (req, res) => {
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
    router.post(
      "/api/user",
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
    router.get("/api/movies", (req, res) => {
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
  router.get("/api/movies/~:id", (req, res) => {
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
  router.get("/api/movies/:id", (req, res) => {
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
  router.get("/api/movies/:a_id/common/:b_id", (req, res) => {
    neode
      .cypher(
        "MATCH (a:Movie {id:{a_id}})<-[:DIRECTED]-(actor)-[:DIRECTED]->(b:Movie {id: {b_id}}) return a, b, actor",
        req.params
      )
      .then(res => {
        return Promise.all([
          /**
           * .hydrateFirst can be called to get the record with
           * the alias provided in the first row, then return
           * this object wrapped in a `Node` instance
           */
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
