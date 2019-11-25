module.exports = {
  id: {
    type: 'uuid',
    primary: true
  },
  name: 'string',
  lastname: 'string',
  email: 'string',
  password: 'string',
  "role": {
    type: "relationship",
    relationship: "CAN_DO",
    direction: "in",
    target: "UserRole"
  },
  "ranch": {
    type: "relationship",
    relationship: "TAKE_CARE_OF",
    direction: "in",
    target: "Ranch"
  }
}