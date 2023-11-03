const {getFirestore} = require('firebase-admin/firestore');

const db = getFirestore();

/**
 * Get the vehicleID based on the license plate number.
 *
 * @param {string} licensePlateNumber - License plate number to search for.
 * @return {string|null} vehicleID if found, or null if not found.
 */
async function getVehicleIDByLicensePlate(licensePlate) {
  try {
    const vehiclesCollection = db.collection('vehicles');
    const {licensePlateNumber: licensePlateNum} = licensePlate;
    // console.log(licensePlateNum)
    const querySnapshot = await vehiclesCollection.where('licensePlateNumber', '==', licensePlateNum).get();
    if (!querySnapshot.empty) {
      const vehicleDoc = querySnapshot.docs[0].data();
      return vehicleDoc.vehicleID;
    }

    return null; // License plate not found.
  } catch (err) {
    console.error('Error occurred while searching for vehicle by license plate: ', err.message);
    throw err;
  }
}

/**
 * Get reservations for a vehicle by its ID.
 *
 * @param {string} vehicleID - Vehicle ID to search for reservations.
 * @return {object} reservations for the vehicle.
 */
async function getVehicleReservation(vehicleID) {
  try {
    const reservationRef = db.collection('reservations');

    const {vehicleId: Vehicleid1} = vehicleID;
    const reservationSnapshot = await reservationRef.where('vehicleID', '==', Vehicleid1).get();

    if (!reservationSnapshot.empty){
        const reservationDoc = reservationSnapshot.docs[0].data();
        return reservationDoc.reservationID;
    }

    return null;
  } catch (err) {
    console.error('Error occurred while retrieving reservations from Firebase Firestore: ', err.message);
    throw err;
  }
}

module.exports = { getVehicleReservation, getVehicleIDByLicensePlate };
