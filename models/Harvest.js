module.exports = {
  id: {
    type: "uuid",
    primary: true
  },
  date: "datetime",
  amount: "float",
  ranch: {
    type: "relationship",
    target: "Ranch",
    relationship: "AT",
    direction: "out"
  },
  crop: {
    type: "relationship",
    target: "Crop",
    relationship: "ON",
    direction: "out"
  }
};
