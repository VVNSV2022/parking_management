/**
 *
 * @param {Object} address - address object
 * @return {boolean} - returns whethere address is true according to the schema
 */
function isValidAddress(address) {
  return (
    address &&
      address.streetNumber &&
      address.city &&
      address.state &&
      address.zipcode &&
      /^\d{5}$/.test(address.zipcode)
  );
}


module.exports = {isValidAddress};
