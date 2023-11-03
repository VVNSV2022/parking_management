const {getVehicleReservation, getVehicleIDByLicensePlate, getparkingIDbyReservation} = require('../thirdParty/elevator.firestore');
/**
 * Get the vehicle ID for the respective license plate.
 *
 * @param {string} licensePlateNumber - The license plate to search for.
 * @return {Promise} A promise that resolves to the vehicle ID.
 * @throws {Error} If an error occurs while retrieving the vehicle ID.
 */


async function vehicleForLicensePlate(licensePlateNumber) {
  try {
    const vehicle = await getVehicleIDByLicensePlate({licensePlateNumber});
    if (!vehicle) {
      return null;
    }

    return vehicle; // Return the vehicle ID
  } catch (err) {
    console.error('Error occurred while getting the vehicle ID: ', err.message);
    throw err;
  }
}

/**
 * Check if there is a reservation for the vehicle ID.
 *
 * @param {string} vehicleID - The vehicle ID to check for reservations.
 * @return {Promise} A promise that resolves to true if a reservation is found, false otherwise.
 * @throws {Error} If an error occurs while checking reservations.
 */
async function findReservation(vehicleID) {
  try {
    const reservations = await getVehicleReservation({vehicleId: vehicleID});

    return reservations; // Reservations with that vehicleID
  } catch (err) {
    console.error('Error occurred while checking reservations: ', err.message);
    throw err;
  }
}


/**
 * Check if there is a parking id for the reservationID.
 *
 * @param {string} reservationID - The reservation ID to check for parkingLotid.
 * @return {Promise} A promise that resolves to true if a parkingLotid is found, false otherwise.
 * @throws {Error} If an error occurs while checking parkingLotIds.
 */
async function parkingIdforReservation(reservationID){
    try {
        const parkingLotID = await getparkingIDbyReservation({ reservationID });
        if (!parkingLotID) {
          return null;
        }
    
        return parkingLotID; // Return the parkingLotID
      } catch (err) {
        console.error('Error occurred while getting the vehicle ID: ', err.message);
        throw err;
      }
    }
  


module.exports = {
  vehicleForLicensePlate,
  findReservation,
  parkingIdforReservation
};
