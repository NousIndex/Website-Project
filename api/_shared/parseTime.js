function parseGachaTime(timeStr) {
  const [datePart, timePart] = timeStr.split(' ');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes, seconds] = timePart.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes, seconds);
}

module.exports = { parseGachaTime };
