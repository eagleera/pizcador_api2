module.exports = {
    id: {
      type: "uuid",
      primary: true
    },
    date: "datetime",
    worked_as:{
        type: "relationship",
        target: "RolePayment",
        relationship: "WORKED_AS",
        direction: "out"
    },
    worker_id:{
        type: "relationship",
        target: "Worker",
        relationship: "ATTEND",
        direction: "out"
    },
    day_type:{
        type: "relationship",
        target: "DayType",
        relationship: "FOR",
        direction: "out"
    },
    activity_type:{
        type: "relationship",
        target: "ActivityType",
        relationship: "TYPE_OF",
        direction: "out"
    },
    ranch: {
      type: "relationship",
      target: "Ranch",
      relationship: "AT",
      direction: "out"
    },
    crop: {
      type: "relationship",
      target: "Crop",
      relationship: "IN",
      direction: "out"
    }
  };
  