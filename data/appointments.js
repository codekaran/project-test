const mongoose = require("mongoose");

const slots = mongoose.Schema(
  {
    startTime: String,
    endTime: String,
  },
  { _id: false }
);

const appointmentSchema = mongoose.Schema({
  date: String,
  slots: [slots],
});

module.exports = mongoose.model("Appointment", appointmentSchema);
