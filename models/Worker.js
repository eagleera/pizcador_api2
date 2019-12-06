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
    "role": {
      type: "relationship",
      relationship: "DOES",
      direction: "in",
      target: "WorkerRole"
    },
    "is": {
      type: "relationship",
      relationship: "IS",
      direction: "in",
      target: "User"
    }
  }