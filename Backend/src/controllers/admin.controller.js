// const {fetchReservations} = require('../thirdParty/admin.firestore.js');
const {getParkingLotID} = require('../thirdParty/parkingLot.firestore.js');
const {getReservationsWithinTimeFrame} = require('../thirdParty/reservation.firestore.js');

// async function getReservations(startTime, endTime) {
//   try {
//     const reservations = await fetchReservations(startTime, endTime);
//     // Additional business logic if necessary
//     return reservations;
//   } catch (err) {
//     console.error('Error in admin controller: ', err.message);
//     throw err;
//   }
// }

/**
 * Get parking statistics.
 *
 * @param {string} parkingLotID
 * @param {Date} fromDate
 * @param {Date} toDate
 * @return {object} result
 */
async function getParkingStats(parkingLotID, fromDate, toDate) {
  try {
    const parkingLot = await getParkingLotID(parkingLotID);
    if (!parkingLot) {
      return {message: 'Parking lot not found', success: false};
    }

    const reservations = await getReservationsWithinTimeFrame(parkingLotID, fromDate, toDate);
    if (!reservations) {
      return {message: 'Error fetching reservations', success: false};
    }

    const totalSpots = parkingLot.numberOfParkingSpots;
    const occupancyPercentage = (reservations.length / totalSpots) * 100;

    const {overstayCount, penaltyCount} = calculateOverstayAndPenalty(reservations);
    const overstayPercentage = (overstayCount / reservations.length) * 100;
    const penaltyPercentage = (penaltyCount / reservations.length) * 100;

    const availabilityPercentage = ((totalSpots - reservations.length) / totalSpots) * 100;

    return {
      data: {
        occupancyPercentage,
        overstayPercentage,
        penaltyPercentage,
        availabilityPercentage,
      },
      success: true,
    };
  } catch (err) {
    console.error('Error occurred while getting parking stats: ', err.message);
    throw err;
  }
}

function calculateOverstayAndPenalty(reservations) {
  let overstayCount = 0;
  let penaltyCount = 0;

  reservations.forEach((reservation) => {
    if (reservation.remarks) {
      if (reservation.remarks.includes('overstay')) {
        overstayCount += 1;
      }
      if (reservation.remarks.includes('penalty')) {
        penaltyCount += 1;
      }
    }
  });

  return {overstayCount, penaltyCount};
}


module.exports = {getParkingStats};
