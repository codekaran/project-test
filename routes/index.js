var express = require("express");
var router = express.Router();
const Appointment = require("../data/appointments");
const helperFunctions = require("../helperFunctions");

/* GET home page. */
// create appointments
router.post("/appointment", async function (req, res, next) {
  try {
    let slot = req.body.slot;
    let date = slot.split(" ")[0];
    let startTime = slot.split(" ")[1];
    let endTime = slot.split(" ")[2];
    let existingAppointment = await Appointment.findOne(
      { date: date },
      { _id: 0 }
    );
    console.log(existingAppointment);
    if (existingAppointment && Object.keys(existingAppointment.slots[0]) > 0) {
      let slots = existingAppointment[0].slots;
      if (helperFunctions.checkOverlappingTime(slots, startTime, endTime)) {
        let result = await Appointment.findOneAndUpdate(
          { date },
          { $push: { slots: { startTime, endTime } } }
        );
        res.status(201).send(await helperFunctions.getDataByDate(date));
        return;
      } else {
        res.status(400).send("Slot not available at this time");
      }
    } else {
      let newAppointment = new Appointment({
        date,
        slots: [{ startTime, endTime }],
      });
      let result = await newAppointment.save();
      res.status(201).send(result.slots);
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong");
  }
});
// get available apointments
router.get("/appointments", async (req, res) => {
  let date = req.body.slot;
  let data = await Appointment.findOne({ date: date }, { _id: 0 });
  console.log(data);
  if (data) {
    let freeSlots = helperFunctions.getFreeSlots(data);
    res.status(200).send(freeSlots);
  } else {
    res.status(200).send("No appointments on this date");
  }
});

// cancel appintents
router.post("/cancelAppointment", async (req, res) => {
  console.log("hello");
  let slot = req.body.slot;
  let date = slot.split(" ")[0];
  let startTime = slot.split(" ")[1];
  let endTime = slot.split(" ")[2];
  console.log(startTime, endTime);
  let existingAppointment = await Appointment.findOne(
    { date: date },
    { _id: 0 }
  );
  if (existingAppointment) {
    let status = await Appointment.findOneAndUpdate(
      { date },
      { $pull: { slots: { startTime, endTime } } }
    );
    console.log(status.modifiedCount);
    if (status) {
      res.status(200).send(await helperFunctions.getDataByDate(date));
    } else {
      res.status(200).send("This time slot does not exists");
    }
  } else {
    res.status(200).send("No Appointment exists for this date");
  }
});

// reschedule appintents

router.post("/rescheduleAppointment", async (req, res) => {
  let oldSlot = req.body.oldSlot;
  let newSlot = req.body.newSlot;
  let oldDate = oldSlot.split(" ")[0];
  let oldStartTime = oldSlot.split(" ")[1];
  let oldEndTime = oldSlot.split(" ")[2];
  let newDate = newSlot.split(" ")[0];
  let newStartTime = newSlot.split(" ")[1];
  let newEndTime = newSlot.split(" ")[2];
  let existingAppointment = await Appointment.findOne(
    { date: oldDate },
    { _id: 0 }
  );
  // deleting old slot
  if (existingAppointment) {
    let status = await Appointment.findOneAndUpdate(
      { date: oldDate },
      { $pull: { slots: { startTime: oldStartTime, endTime: oldEndTime } } }
    );
    console.log(status.modifiedCount);
    if (status) {
      // res.status(200).send(await helperFunctions.getDataByDate(oldDate));
      console.log("deleted the old record");
    } else {
      res.status(200).send("This time slot does not exists");
      return;
    }
    // adding the new slot
    let newAppointment = await Appointment.findOne(
      { date: newDate },
      { _id: 0 }
    );
    console.log(newAppointment.slots.length);
    if (newAppointment && Object.keys(newAppointment.slots[0]) > 0) {
      if (
        helperFunctions.checkOverlappingTime(
          existingAppointment.slots,
          newStartTime,
          newEndTime
        )
      ) {
        let result = await Appointment.findOneAndUpdate(
          { date: newDate },
          { $push: { slots: { newStartTime, newEndTime } } }
        );
        res.status(201).send(await helperFunctions.getDataByDate(newDate));
        return;
      } else {
        res.status(400).send("Slot not available at this time");
      }
    } else {
      let newAppointment = new Appointment({
        date: newDate,
        slots: [{ startTime: newStartTime, endTime: newEndTime }],
      });
      let result = await newAppointment.save();
      res.status(201).send(result.slots);
    }
  } else {
    res.status(200).send("No Appointment exists for this date");
  }
});

module.exports = router;
