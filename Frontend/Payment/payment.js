// const {
//   savePaymentMethod,
//   makePayment,
//   getUserPaymentMethods,
// } = require('../..Backend/src/controllers/payment.controller.js');

// const userID = '123456'; // actual user ID

// // Function to populate the saved card dropdown
// async function populateSavedCards() {
//   const savedCardDropdown = document.getElementById('saved-card-dropdown');

//   try {
//       const result = await getUserPayment(userID);

//       savedCardDropdown.innerHTML = '';

//       // Add a default option
//       const defaultOption = document.createElement('option');
//       defaultOption.text = 'Select a payment option';
//       savedCardDropdown.add(defaultOption);

//       // Add saved cards to the dropdown
//       result.forEach((card, index) => {
//           const option = document.createElement('option');
//           option.value = card.savedPaymentMethodID;
//           option.text = `Card ending in ${card.cardNumber.slice(-4)} (${card.expiryDate})`;
//           savedCardDropdown.add(option);
//       });
//   } catch (error) {
//       console.error('Error fetching saved cards:', error.message);
//   }
// }

// // Save user's payment method
// async function saveUserPayment(userID, paymentType, paymentMethodID, billingDetails) {
//   try {
//       const result = await savePaymentMethod(userID, paymentType, paymentMethodID, billingDetails);
//       console.log(result);
//       // Handle the result as needed
//   } catch (error) {
//       console.error('Error:', error.message);
//       // Handle errors
//   }
// }

// // Make a payment
// async function makeUserPayment(userID, amount, description, savedPaymentMethodID) {
//   try {
//       const result = await makePayment(userID, amount, description, savedPaymentMethodID); 
//       console.log(result);
//   } catch (error) {
//       console.error('Error:', error.message);
//   }
// }

// // Get user's saved payment methods
// async function getUserPayment(userID) {
//   try {
//       const result = await getUserPaymentMethods(userID);
//       return result; // Assuming the result is an array of saved payment methods
//   } catch (error) {
//       console.error('Error:', error.message);
//       return []; // Return an empty array if there's an error
//   }
// }

// // Call the function to populate the saved card dropdown when the page loads
// document.addEventListener('DOMContentLoaded', () => {
//   populateSavedCards();
// });

// // Example functions, replace with your actual implementation
// function handlePayment() {
// // Call the function to save user's payment method
//   const paymentTypeElement = document.getElementById('payment-type');
//   const paymentType = paymentTypeElement.value;
//   const billingDetails = {
//       name: document.getElementById('billing-name').value,
//       email: document.getElementById('billing-email').value,
//       phone: document.getElementById('billing-phone').value,
//       address: {
//           line1: document.getElementById('billing-address-line1').value,
//           line2: document.getElementById('billing-address-line2').value,
//           city: document.getElementById('billing-city').value,
//           state: document.getElementById('billing-state').value,
//           postal_code: document.getElementById('billing-postal-code').value,
//       },
//   };
//   // Call the function to handle payment and save the payment method
//   handlePaymentMethod(paymentType,billingDetails);
// }

// function handleRepeatPayment() {
//   // Call the function to make a payment using saved card details
//   populateSavedCards();
//   const savedCardDropdown = document.getElementById('saved-card-dropdown');
//   const savedPaymentMethodID = savedCardDropdown.value;
//   makeUserPayment(userID, 100, "sample", savedPaymentMethodID); //description trails
// }

// // Function to handle the payment method creation and save
// // Function to handle the payment method creation and save
// async function handlePaymentMethod(paymentType, billingDetails) {
//   try {
//     // Use Stripe.js to create a Payment Method for the card
//     const stripe = Stripe('pk_test_51O5BKpIML3jMLAcettZqNVnL1vsrfiNDEevn85N5pAKJdhKcGdIBL65tXBI6K9pf2ZQr4Mr2nos18TNPyOkq6tU700jTjo4Kjw'); // Replace with your Stripe public key
//     const cardElement = document.getElementById('card-number');

//     const { paymentMethod, error } = await stripe.createPaymentMethod({
//       type: paymentType,
//       card: cardElement,
//     });

//     if (error) {
//       console.error('Error creating Payment Method:', error.message);
//       // Handle errors
//       return;
//     }

//     // Here, paymentMethod.id represents the Payment Method ID
//     const paymentMethodID = paymentMethod.id;

//     // Now, you can call the function to save the user's payment method with the obtained paymentMethodID
//     await saveUserPayment(userID, paymentType, paymentMethodID, billingDetails);

//     // Call the function to make a payment using the saved payment method
//     const amount = 100; // Replace with the actual payment amount
//     const description = 'sample'; // Replace with the actual payment description
//     await makeUserPayment(userID, amount, description, paymentMethodID);  //amount, description

//   } catch (error) {
//     console.error('Error:', error.message);
//   }
// }




const {
  savePaymentMethod,
  makePayment,
  getUserPaymentMethods,
} = require('../..Backend/src/controllers/payment.controller.js');

const{
  createPaymentMethod,
} = require('../..Backend/src/thirdParty/StripeAPI.js');

function getPaymentInfo() {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    userID: urlParams.get('userID'), // user ID 
    amount: parseFloat(urlParams.get('amount')) || 0, // amount 
  };
}

async function populateSavedCards(userID) {
  const savedCardDropdown = document.getElementById('saved-card-dropdown');

  try {
    const result = await getUserPayment(userID);

    savedCardDropdown.innerHTML = '';

    // Add a default option
    const defaultOption = document.createElement('option');
    defaultOption.text = 'Select a payment option';
    savedCardDropdown.add(defaultOption);

    // Add saved cards to the dropdown
    result.forEach((element, index) => {
      const option = document.createElement('option');
      option.value = element.card.id;
      const paymentdisplay = element.card.last4;
      option.text = `Payment Method ID: ${paymentdisplay}`;
      savedCardDropdown.add(option);
    });
  } catch (error) {
    console.error('Error fetching saved cards:', error.message);
  }
}


// Save user's payment method
async function saveUserPayment(userID, paymentType, paymentMethodID, billingDetails) {
  try {
    const result = await savePaymentMethod(userID, paymentType, paymentMethodID, billingDetails);
    console.log(result);
    // Handle the result as needed
  } catch (error) {
    console.error('Error:', error.message);
    // Handle errors
  }
}

// Make a payment
async function makeUserPayment(userID, amount, description, savedPaymentMethodID) {
  try {
    const result = await makePayment(userID, amount, description, savedPaymentMethodID);
    console.log(result);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function getUserPayment(userID) {
  try {
      const result = await getUserPaymentMethods(userID);
      return result; // Assuming the result is an array of saved payment methods
  } catch (error) {
      console.error('Error:', error.message);
      return []; // Return an empty array if there's an error
  }
}

// Call the function to populate the saved card dropdown when the page loads
document.addEventListener('DOMContentLoaded', () => {
  const paymentInfo = getPaymentInfo();
  populateSavedCards(getPaymentInfo.userID);
});

// Example functions, replace with your actual implementation
function handlePayment() {
  // Call the function to save user's payment method
  const paymentTypeElement = document.getElementById('payment-type');
  const paymentType = paymentTypeElement.value;
  const billingDetails = {
    name: document.getElementById('billing-name').value,
    email: document.getElementById('billing-email').value,
    phone: document.getElementById('billing-phone').value,
    address: {
      line1: document.getElementById('billing-address-line1').value,
      line2: document.getElementById('billing-address-line2').value,
      city: document.getElementById('billing-city').value,
      state: document.getElementById('billing-state').value,
      postal_code: document.getElementById('billing-postal-code').value,
    },
  };
  // Call the function to handle payment and save the payment method
  handlePaymentMethod(getPaymentInfo.userID, paymentType, billingDetails);
}

function handleRepeatPayment() {
  // Call the function to make a payment using saved card details
  const savedCardDropdown = document.getElementById('saved-card-dropdown');
  const savedPaymentMethodID = savedCardDropdown.value;
  makeUserPayment(getPaymentInfo.userID, getPaymentInfo.amount, "sample", savedPaymentMethodID);
}


async function handlePaymentMethod(userID, paymentType, billingDetails) {
  try {
    // Use Stripe.js to create a Token for the card
    const stripe = Stripe('pk_test_51O5BKpIML3jMLAcettZqNVnL1vsrfiNDEevn85N5pAKJdhKcGdIBL65tXBI6K9pf2ZQr4Mr2nos18TNPyOkq6tU700jTjo4Kjw'); // Replace with your Stripe public key
    const cardElement = document.getElementById('card-number');

    const { token, error } = await stripe.createToken(cardElement);

    if (error) {
      console.error('Error creating token:', error.message);
      return;
    }
    const paymentToken = token.id;
    //const customerID = getPaymentInfo.customerID;

    // Calling the function to create a payment method
    const createdPaymentMethod = await createPaymentMethod(userID, paymentType, paymentToken, billingDetails);

    if (createdPaymentMethod) {
      const amount = getPaymentInfo.amount;
      const description = 'sample';
      await makeUserPayment(userID, amount, description, createdPaymentMethod.id);
    } 
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Function to handle the payment method creation and save
// async function handlePaymentMethod(paymentType, billingDetails) {
//   try {
//     // Use Stripe.js to create a Payment Method for the card
//     const stripe = Stripe('pk_test_51O5BKpIML3jMLAcettZqNVnL1vsrfiNDEevn85N5pAKJdhKcGdIBL65tXBI6K9pf2ZQr4Mr2nos18TNPyOkq6tU700jTjo4Kjw'); // Replace with your Stripe public key
//     const cardElement = document.getElementById('card-number');

//     const { paymentMethod, error } = await stripe.createPaymentMethod({
//       type: paymentType,
//       card: cardElement,
//     });

//     if (error) {
//       console.error('Error creating Payment Method:', error.message);
//       // Handle errors
//       return;
//     }

//     // Here, paymentMethod.id represents the Payment Method ID
//     const paymentMethodID = paymentMethod.id;

//     //call the function to save the user's payment method with the obtained paymentMethodID
//     await saveUserPayment(getPaymentInfo.userID, paymentType, paymentMethodID, billingDetails);

//     //function to make a payment using the saved payment method
//     const amount = getPaymentInfo.amount;
//     const description = 'sample';
//     await makeUserPayment(getPaymentInfo.userID, amount, description, paymentMethodID);  // amount, description

//   } catch (error) {
//     console.error('Error:', error.message);
//   }
// }



// Function to populate the saved card dropdown
// async function populateSavedCards(userID) {
//   const savedCardDropdown = document.getElementById('saved-card-dropdown');

//   try {
//     const result = await getUserPayment(userID);

//     savedCardDropdown.innerHTML = '';

//     // Add a default option
//     const defaultOption = document.createElement('option');
//     defaultOption.text = 'Select a payment option';
//     savedCardDropdown.add(defaultOption);

//     // Add saved cards to the dropdown
//     result.forEach((card, index) => {
//       const option = document.createElement('option');
//       option.value = card.savedPaymentMethodID;
//       option.text = `Card ending in ${card.cardNumber.slice(-4)} (${card.expiryDate})`;
//       savedCardDropdown.add(option);
//     });
//   } catch (error) {
//     console.error('Error fetching saved cards:', error.message);
//   }
// }
