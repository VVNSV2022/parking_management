const { getFirestore } = require('firebase-admin/firestore');

const db = getFirestore();

/**
 * Get the layout_type based on the layout id.
 *
 * @param {string} layout_id - Layout id(parkingLotid mapped to) to search for.
 * @return {string|null} Layout-type if found, or null if not found.
 */
async function getLayoutbyParkingId(layout_id) {
  try {
    const layoutCollection = db.collection('parkingLayout');
    // console.log(layoutCollection)
    const layoutSnapshot = await layoutCollection.where('layout_id', '==', layout_id).get();
    if (!layoutSnapshot.empty) {
      const layoutDoc = layoutSnapshot.docs[0].data();
      parkingLayouttype = layoutDoc.layoutType;
      
      return parkingLayouttype   
    }

    return null;
  } catch (err) {
    console.error('Error occurred while searching for layout by layoutid: ', err.message);
    throw err;
  }
}


module.exports = { getLayoutbyParkingId};