module.exports = function(neode) {
  const router = require("express").Router();
  router.post("/user_role", (req, res, next) => {
    neode.merge("UserRole", {
      name: "Reader"
    });
    neode.merge("UserRole", {
      name: "Editor"
    });
    neode.merge("UserRole", {
      name: "Publisher"
    });
    neode.merge("UserRole", {
      name: "Architect"
    });
    neode.merge("UserRole", {
      name: "Admin"
    });
    res.data = "se armo";
    next();
  }),
    router.post("/worker_role", (req, res, next) => {
      neode.merge("WorkerRole", {
        name: "Jornalero"
      });
      neode.merge("WorkerRole", {
        name: "Supervisor"
      });
      neode.merge("WorkerRole", {
        name: "Gerente"
      });
      neode.merge("WorkerRole", {
        name: "Dueño"
      });
      neode.merge("WorkerRole", {
        name: "Velador"
      });
      neode.merge("WorkerRole", {
        name: "Regador"
      });
      neode.merge("WorkerRole", {
        name: "Encargado"
      });
      neode.merge("WorkerRole", {
        name: "Pizcador"
      });
      neode.merge("WorkerRole", {
        name: "Seleccionador"
      });
      neode.merge("WorkerRole", {
        name: "Transportista"
      });
      res.data = "se armo";
      next();
    }),
    router.post("/size_types", (req, res, next) => {
      neode.merge("SizeType", {
        name: "Hectarea",
        unit: "ha"
      });
      neode.merge("SizeType", {
        name: "Metros cuadrados",
        unit: "m^2"
      });
      neode.merge("SizeType", {
        name: "Pies cuadrados",
        unit: "ft^2"
      });
      res.data = "se armo";
      next();
    });
  return router;
};
