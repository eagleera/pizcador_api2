module.exports = {
  id: {
    type: 'uuid',
    primary: true
  },
  name: 'string',
  address: 'string',
  owner: 'string',
  zipcode: 'string',
  size: 'float',
  "size_type": {
    type: "relationship",
    relationship: "UNITS_IN",
    direction: "in",
    target: "SizeType",
    properties: {
      size: "number"
    }
  },
  "take_care_of": {
    type: "relationship",
    relationship: "TAKE_CARE_OF",
    direction: "out",
    target: "User"
  }
}