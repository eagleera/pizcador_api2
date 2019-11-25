module.exports = {
  id: {
    type: "uuid",
    primary: true
  },
  wage: "float",
  init_date: "datetime",
  end_date: "datetime",
  role: {
    type: "relationship",
    relationship: "GET_PAID",
    direction: "in",
    target: "WorkerRole"
  },
  ranch: {
    type: "relationship",
    relationship: "AT",
    direction: "in",
    target: "Ranch"
  }
};
