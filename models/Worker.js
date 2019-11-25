module.exports = {
    id: {
      type: 'uuid',
      primary: true
    },
    name: 'string',
    lastname: 'string',
    "ranch": {
      type: "relationship",
      relationship: "WORKS_AT",
      direction: "in",
      target: "Ranch"
    },
    "is": {
      type: "relationship",
      relationship: "IS",
      direction: "in",
      target: "User"
    }
  }