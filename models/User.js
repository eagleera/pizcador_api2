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
  }
}