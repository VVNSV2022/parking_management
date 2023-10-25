const {addReservation} = require('../thirdParty/firebaseData');

/**
 *
 * @param {object} reservationId - reservation id
 * @param {object} data - reservation data
 * @return {result} - reservation object
 */
async function createReservation(reservationId, data) {
  try {
    const result = await addReservation(reservationId, data);
    return result;
  } catch (err) {
    console.error('Error occured while creating the reservation: ', err.message);
    throw err;
  }
}


module.exports = {createReservation};
