module.exports = {
  id: {
    type: "uuid",
    primary: true
  },
  date: "date",
  worker_id: {
    type: "relationship",
    target: "Worker",
    relationship: "ATTEND",
    direction: "out",
    properties: {
      payment: "uuid",
      daytype: "uuid"
    }
  },
  crop: {
    type: "relationship",
    target: "Crop",
    relationship: "IN",
    direction: "out"
  }
};
