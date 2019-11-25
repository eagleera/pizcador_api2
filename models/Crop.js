module.exports = {
  id: {
    type: "uuid",
    primary: true
  },
  init_date: "datetime",
  end_date: "datetime",
  ranch: {
    type: "relationship",
    target: "Ranch",
    relationship: "AT",
    direction: "out"
  },
  crop_type: {
    type: "relationship",
    target: "CropType",
    relationship: "OF",
    direction: "out"
  }
};
