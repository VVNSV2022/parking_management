const {getRegionMemberships, getParkingLotByRegion} = require('../thirdParty/membership.firestore');


/**
 *
 * @param {string} regionID - The regionID of the region whose memberships are to be fetched
 * @return {object} - result
 */
async function getMembershipsByRegion(regionID) {
  try {
    const result = await getRegionMemberships(regionID);
    if (result) {
      const parkingLotresult = await getParkingLotByRegion(regionID);
      if (parkingLotresult) {
        return {message: 'successfully fetched the memebership results', success: true, data: result, regions: parkingLotresult};
      }
    }
    return {message: 'cannot find the details with this regionID', success: false};
  } catch (err) {
    console.error('Error occurred while handling the request to get the saved payment methods: ', err.message);
    return {message: 'Internal Server Error', success: false};
  }
}



module.exports = {getMembershipsByRegion};
