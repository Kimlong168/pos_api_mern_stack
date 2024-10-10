const getNumberOfDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const differenceInMillis = end - start;
  const differenceInDays = Math.ceil(
    differenceInMillis / (1000 * 60 * 60 * 24)
  );

  return differenceInDays + 1; // Add 1 to include the end date
};

module.exports = {
  getNumberOfDays,
};
