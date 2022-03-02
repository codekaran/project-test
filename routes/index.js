var express = require("express");
const { compile } = require("morgan");
var router = express.Router();
const Appointment = require("../data/appointments");
const helperFunctions = require("../helperFunctions");

/* GET home page. */
// create appointments
router.post("/appointment", async function (req, res, next) {
  try {
    let slot = req.body.slot;
    let startTime = slot.split(" ")[1];
    let endTime = slot.split(" ")[2];
    startTime =
      parseInt(startTime.split(":")[0]) * 100 +
      parseInt(startTime.split(":")[1]);
    endTime =
      parseInt(endTime.split(":")[0]) * 100 + parseInt(endTime.split(":")[1]);
    let appointmentDate = slot.split(" ")[0];
    if (endTime <= startTime) {
      res.status(400).send("Invalid slot");
      return;
    }
    // if no records for  the given date
    let dateExists = await Appointment.find({
      appointmentDate,
    });
    if (dateExists.length == 0) {
      let output = await helperFunctions.saveInDB(
        appointmentDate,
        startTime,
        endTime
      );
      output = helperFunctions.getTimeInString(startTime, endTime, output);
      res.status(200).send(output);
      return;
    }

    // checking if exsiting start time >= incoming End time and Existing End time < incoming Start Time
    let existingAppointment = await Appointment.find({
      appointmentDate,
      $or: [{ startTime: { $gte: endTime } }, { endTime: { $lte: startTime } }],
    });
    let count = await Appointment.count({ appointmentDate });
    console.log(existingAppointment);
    if (existingAppointment.length == count) {
      let output = await helperFunctions.saveInDB(
        appointmentDate,
        startTime,
        endTime
      );
      output = helperFunctions.getTimeInString(startTime, endTime, output);

      res.status(200).send(output);
    } else {
      res.status(200).send("Slot not available");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong");
  }
});
// get available apointments
router.get("/appointments", async (req, res) => {
  let appointmentDate = req.body.slot;

  let data = await Appointment.findOne({ appointmentDate }, { _id: 0 });
  console.log(data);
  if (data) {
    let freeSlots = await helperFunctions.getFreeSlots(appointmentDate);
    res.status(200).send(freeSlots);
  } else {
    res.status(200).send("No appointments on this date");
  }
});

// cancel appintents
router.post("/cancelAppointment", async (req, res) => {
  console.log("hello");
  let slot = req.body.slot;
  let appointmentDate = slot.split(" ")[0];
  let startTime = slot.split(" ")[1];
  let endTime = slot.split(" ")[2];
  startTime =
    parseInt(startTime.split(":")[0]) * 100 + parseInt(startTime.split(":")[1]);
  endTime =
    parseInt(endTime.split(":")[0]) * 100 + parseInt(endTime.split(":")[1]);
  console.log(startTime, endTime);
  let status = await Appointment.deleteOne({
    appointmentDate,
    startTime,
    endTime,
  });
  console.log(status);
  if (status.deletedCount > 0) {
    res.status(200).send("deleted the slot");
  } else {
    res.status(200).send("This time slot does not exists");
  }
});

// reschedule appintents

router.post("/rescheduleAppointment", async (req, res) => {
  let oldSlot = req.body.oldSlot;
  let newSlot = req.body.newSlot;

  let oldDate = oldSlot.split(" ")[0];
  let oldStartTime = oldSlot.split(" ")[1];
  oldStartTime =
    parseInt(oldStartTime.split(":")[0]) * 100 +
    parseInt(oldStartTime.split(":")[1]);
  let oldEndTime = oldSlot.split(" ")[2];
  oldEndTime =
    parseInt(oldEndTime.split(":")[0]) * 100 +
    parseInt(oldEndTime.split(":")[1]);
  let newDate = newSlot.split(" ")[0];
  let newStartTime = newSlot.split(" ")[1];
  newStartTime =
    parseInt(newStartTime.split(":")[0]) * 100 +
    parseInt(newStartTime.split(":")[1]);
  let newEndTime = newSlot.split(" ")[2];
  newEndTime =
    parseInt(newEndTime.split(":")[0]) * 100 +
    parseInt(newEndTime.split(":")[1]);

  let status = await Appointment.deleteOne({
    appointmentDate: oldDate,
    startTime: oldStartTime,
    endTime: oldEndTime,
  });
  let deletedStatus = "Old Time slot does not exists";
  if (status.deletedCount > 0) {
    console.log("deleted");
    deletedStatus = "Deleted the old slot";
  }
  //  adding the new slot
  // if no records for  the given date
  let dateExists = await Appointment.find({
    appointmentDate: newDate,
  });
  if (dateExists.length == 0) {
    let output = await helperFunctions.saveInDB(
      newDate,
      newStartTime,
      newEndTime
    );
    output = helperFunctions.getTimeInString(newStartTime, newEndTime, output);
    res
      .status(200)
      .send({ "delete status": deletedStatus, "new appointments": output });
    return;
  }

  // checking if exsiting start time >= incoming End time and Existing End time < incoming Start Time
  let existingAppointment = await Appointment.find({
    appointmentDate: newDate,
    $or: [
      { startTime: { $gte: newEndTime } },
      { endTime: { $lte: newStartTime } },
    ],
  });
  console.log(existingAppointment);
  let count = await Appointment.count({ appointmentDate: newDate });
  if (existingAppointment.length == count) {
    let output = await helperFunctions.saveInDB(
      newDate,
      newStartTime,
      newEndTime
    );
    output = helperFunctions.getTimeInString(newStartTime, newEndTime, output);

    res
      .status(200)
      .send({ "delete status": deletedStatus, "new appointments": output });
  } else {
    res.status(200).send({
      "delete status": deletedStatus,
      "new appointments": "Slot not available",
    });
  }
});

module.exports = router;
