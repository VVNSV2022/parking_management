const {fetchReservations} = require('../thirdParty/admin.firestore');

async function getReservations(startTime, endTime) {
  try {
    const reservations = await fetchReservations(startTime, endTime);
    // Additional business logic if necessary
    return reservations;
  } catch (err) {
    console.error('Error in admin controller: ', err.message);
    throw err;
  }
}

module.exports = {getReservations};
