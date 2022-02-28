const mongoose = require("mongoose");

// const slots = mongoose.Schema(
//   {
//     startTime: String,
//     endTime: String,
//   },
//   { _id: false }
// );

const appointmentSchema = mongoose.Schema({
  appointmentDate: String,
  startTime: Number,
  endTime: Number,
});

module.exports = mongoose.model("Appointment", appointmentSchema);
