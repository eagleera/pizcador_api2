module.exports = {
  labels: ["UserRole"],
  id: {
    type: "uuid",
    primary: true
  },
  name: "string",
  can_do: {
    type: "relationship",
    target: "User",
    relationship: "CAN_DO",
    direction: "out",
    properties: {
      name: "string"
    }
  }
};
