// Headline model

// Require mongoose
var mongoose = require("mongoose");

// create headline with schema
var Schema = mongoose.Schema;

// Create the headlineSchema with the right class
var headlineSchema = new Schema({
  // headline, a string, must be entered
  headline: {
    type: String,
    required: true,
    unique: { index: { unique: true } }
  },
  // string must be entered
  summary: {
    type: String,
    required: true
  },
  // url must be entered - string 
  url: {
    type: String,
    required: true
  },
  // ddate is a string here 
  date: {
    type: Date,
    default: Date.now
  },
  saved: {
    type: Boolean,
    default: false
  }
});

// use headline schema to create headline
var Headline = mongoose.model("Headline", headlineSchema);

// export Headline model
module.exports = Headline;