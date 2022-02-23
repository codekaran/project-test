const Appointment = require("./data/appointments");

const checkOverlappingTime = (slots, startTime, endTime) => {
  let incomingStartTime;
  let incomingEndTime;
  let output;
  if (typeof startTime != "number") {
    incomingStartTime =
      parseInt(startTime.split(":")[0]) * 100 +
      parseInt(startTime.split(":")[1]);
    incomingEndTime =
      parseInt(endTime.split(":")[0]) * 100 + parseInt(endTime.split(":")[1]);
  } else {
    console.log("got number");
    incomingStartTime = startTime;
    incomingEndTime = endTime;
  }

  for (let i of slots) {
    let existingStartTime =
      parseInt(i.startTime.split(":")[0]) * 100 +
      parseInt(i.startTime.split(":")[1]);
    let existingEndTime =
      parseInt(i.endTime.split(":")[0]) * 100 +
      parseInt(i.endTime.split(":")[1]);
    // console.log(
    //   incomingEndTime,
    //   incomingStartTime,
    //   existingStartTime,
    //   existingEndTime
    // );
    // console.log(
    //   incomingStartTime > existingStartTime &&
    //     incomingStartTime < existingEndTime,
    //   incomingEndTime < existingStartTime && incomingEndTime > existingEndTime,
    //   incomingStartTime < existingStartTime &&
    //     incomingEndTime > existingEndTime,
    //   incomingStartTime == existingStartTime &&
    //     incomingEndTime == existingEndTime
    // );
    if (
      (incomingStartTime > existingStartTime &&
        incomingStartTime < existingEndTime) ||
      (incomingEndTime > existingStartTime &&
        incomingEndTime < existingEndTime) ||
      (incomingStartTime < existingStartTime &&
        incomingEndTime > existingEndTime) ||
      (incomingStartTime == existingStartTime &&
        incomingEndTime == existingEndTime)
    ) {
      console.log("time is overlapping");
      return false;
    }
  }
  return true;
};
exports.checkOverlappingTime = checkOverlappingTime;

const getDataByDate = async (date) => {
  let data = await Appointment.findOne({ date }, { _id: 0 });
  console.log(data);
  return data;
};
exports.getDataByDate = getDataByDate;

getFreeSlots = (data) => {
  let availableSlots = [];
  let sortedSlots = data.slots.sort((a, b) => {
    return (
      parseInt(a.startTime.split(":")[0]) * 100 +
      parseInt(a.startTime.split(":")[1]) -
      (parseInt(b.startTime.split(":")[0]) * 100 +
        parseInt(b.startTime.split(":")[1]))
    );
  });
  console.log(sortedSlots);
  const range = (start, stop, step) =>
    Array.from(
      { length: (stop - start) / step + 1 },
      (_, i) => start + i * step
    );
  let flag = 0;
  for (let i of range(900, 1700, 100)) {
    flag = 0;
    for (let j of sortedSlots) {
      if (
        parseInt(j.startTime.split(":")[0]) * 100 +
          parseInt(j.startTime.split(":")[1]) ===
        i
      ) {
        flag = 1;
        break;
      }
    }
    if (flag == 0) {
      if (checkOverlappingTime(sortedSlots, i, i + 100)) {
        console.log("here");
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
  }
  console.log(availableSlots);

  return availableSlots;
};

const getTime = (time) => {
  console.log(time);
  if (String(time).length == 3) {
    let final = String(time).slice(0, 1) + ":" + "00";
    console.log(final);
    return String(time).slice(0, 1) + ":" + "00";
  }
  let final = String(time).slice(0, 2) + ":" + "00";
  console.log(final);
  return String(time + 100).slice(0, 2) + ":" + "00";
};
exports.getFreeSlots = getFreeSlots;
