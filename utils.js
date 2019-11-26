function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function parseDate(str) {
  var mdy = str.split('/');
  return new Date(mdy[2], mdy[0] - 1, mdy[1]);
}

function daydiff(first, second) {
  return Math.round((second - first) / (1000 * 60 * 60 * 24));
}
