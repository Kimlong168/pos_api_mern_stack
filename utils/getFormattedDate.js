// Function to format the date for the input field
const getFormattedDate = (isoString) => {
  if (!isoString) {
    return "";
  }
  const date = new Date(isoString);

  // Options for the date format
  const options = { day: "numeric", month: "short", year: "numeric" };

  // Formatting the date to "10 Jan 2023"
  return date.toLocaleDateString("en-GB", options);
};

// get time with AM and PM

const getFormattedTimeWithAMPM = (isoString) => {
  if (!isoString) {
    return "";
  }
  const date = new Date(isoString);

  // Options for the date format, including seconds
  const options = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  };

  // Formatting the date to include hours, minutes, and seconds with AM/PM
  return date.toLocaleTimeString("en-GB", options);
};

// get formatted date and time with AM and PM



module.exports = {
  getFormattedDate,
  getFormattedTimeWithAMPM,
};
