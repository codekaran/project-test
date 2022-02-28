const Appointment = require("./data/appointments");

const getFreeSlots = async (appointmentDate) => {
  const range = (start, stop, step) =>
    Array.from(
      { length: (stop - start) / step + 1 },
      (_, i) => start + i * step
    );
  let availableSlots = [];
  for (let i of range(900, 1700, 100)) {
    // checking if exsiting start time >= incoming End time and Existing End time < incoming Start Time
    let existingAppointment = await Appointment.find({
      appointmentDate,
      $or: [{ startTime: { $gte: i + 100 } }, { endTime: { $lte: i } }],
    });

    if (existingAppointment.length > 0) {
      console.log(i, i + 100);
      availableSlots.push({
        startTime:
          String(i).length == 3
            ? String(i).slice(0, 1) + ":" + "00"
            : String(i).slice(0, 2) + ":" + "00",
        endTime: String(i + 100).slice(0, 2) + ":" + "00",
      });
    }
  }
  return availableSlots;
};

exports.getFreeSlots = getFreeSlots;

const saveInDB = async (appointmentDate, startTime, endTime) => {
  let newAppointment = new Appointment({
    appointmentDate,
    startTime,
    endTime,
  });
  let result = await newAppointment.save();
  return result;
};
exports.saveInDB = saveInDB;

const getTimeInString = (startTime, endTime, output) => {
  let start =
    String(startTime).length == 3
      ? String(startTime).slice(0, 1) + ":" + String(endTime).slice(2, 4)
      : String(startTime).slice(0, 2) + ":" + String(endTime).slice(2, 4);
  let end = String(endTime).slice(0, 2) + ":" + String(endTime).slice(2, 4);
  output._doc.startTime = start;
  output._doc.endTime = end;
  return output;
};
exports.getTimeInString = getTimeInString;
