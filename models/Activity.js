module.exports = {
    id: {
      type: "uuid",
      primary: true
    },
    name: "string",
    description: "string",
    date: "date",
    created_by:{
        type: "relationship",
        target: "User",
        relationship: "CREATED_BY",
        direction: "out"
    },
    in_charge:{
        type: "relationship",
        target: "Worker",
        relationship: "IN_CHARGE",
        direction: "out"
    },
    activity_status:{
        type: "relationship",
        target: "ActivityStatus",
        relationship: "IN_STATUS",
        direction: "out"
    },
    activity_type:{
        type: "relationship",
        target: "ActivityType",
        relationship: "TYPE_OF",
        direction: "out"
    },
    crop: {
      type: "relationship",
      target: "Crop",
      relationship: "CROP_OF",
      direction: "out"
    }
  };
  