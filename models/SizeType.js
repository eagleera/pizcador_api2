module.exports = {
  id: {
    type: "uuid",
    primary: true
  },
  name: "string",
  unit: "string",
  units_in: {
    type: "relationship",
    target: "User",
    relationship: "UNITS_IN",
    direction: "out",
  }
};
