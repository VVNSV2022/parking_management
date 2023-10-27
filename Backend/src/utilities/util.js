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

/**
 *
 * @param {OBJECT} billingDetails - address and details of user
 * @return {BOOLEAN} true/false
 */
function verifyBillingDetails(billingDetails) {
  const requiredProperties = ['address', 'name', 'email', 'phone'];

  for (const property of requiredProperties) {
    if (!billingDetails.hasOwnProperty(property) || billingDetails[property] === null) {
      return false; // Return false if any required property is missing or null
    }
  }

  return true; // Return true if all required properties have values
}

/**
 *
 * @param {object} bankAccount - bank details
 * @return {boolean} true/false
 */
function verifyBankAccountDetails(bankAccount) {
  if (!bankAccount.account_number || !bankAccount.routing_number) {
    return false;
  }

  if (!bankAccount.account_type || !['checkings', 'savings'].includes(bankAccount.account_type)) {
    return false;
  }

  return true;
}

module.exports = {isValidAddress, verifyBillingDetails, verifyBankAccountDetails};
