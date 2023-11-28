// document.addEventListener('DOMContentLoaded', () => {
//   const paymentInfo = getPaymentInfo();
//   populateSavedCards(paymentInfo.userID);
// });
const userID = 12345678

function getPaymentInfo() {
  const urlParams = new URLSearchParams(window.location.search);
  const paymentAmount = urlParams.get('amount');
  const userID = urlParams.get('userID');

  if (paymentAmount) {
    document.getElementById('amount').textContent = paymentAmount;
  }

  if (userID) {
    document.getElementById('userId').textContent = userID;
  }
}

async function populateSavedCards(userID) {
  const savedCardDropdown = document.getElementById('saved-card-dropdown');

  try {
    const result = await getUserPayment(userID);

    savedCardDropdown.innerHTML = '';
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
    const response = await fetch('/payments/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userID: userID,
        paymentType: paymentType,
        paymentToken: paymentMethodID,
        BillingDetails: billingDetails,
      }),
    });

    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Make a payment
async function makeUserPayment(userID, amount, description, savedPaymentMethodID) {
  try {
    const response = await fetch('http://127.0.0.1:4000/payments/makePayment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userID: userID,
        amount: amount,
        description: description,
        savePaymentMethodID: savedPaymentMethodID,
      }),
    });

    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Get user's saved payment methods
async function getUserPayment(userID) {
  try {
    const response = await fetch(`/payments/?userID=${userID}`);
    const result = await response.json();
    return result; 
  } catch (error) {
    console.error('Error:', error.message);
    return []; 
  }
}

function handlePayment() {
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
  console.log('Billing Details:', billingDetails);
  //const paymentInfo = getPaymentInfo();
  userID= 12345678
  amount = 5
  handlePaymentMethod(userID, paymentType, billingDetails);
}

function handleRepeatPayment() {
  const savedCardDropdown = document.getElementById('saved-card-dropdown');
  const savedPaymentMethodID = savedCardDropdown.value;
  //const paymentInfo = getPaymentInfo();
  userID= 12345678
  amount = 5
  makeUserPayment(userID, amount, "sample", savedPaymentMethodID);
}

async function handlePaymentMethod(userID, paymentType, billingDetails) {
  try {
    const stripe = Stripe('pk_test_51O5BKpIML3jMLAcettZqNVnL1vsrfiNDEevn85N5pAKJdhKcGdIBL65tXBI6K9pf2ZQr4Mr2nos18TNPyOkq6tU700jTjo4Kjw'); 
    const cardElement = document.getElementById('card-number');

    const { token, error } = await stripe.createToken(cardElement);
    console.log(token, error);
    if (error) {
      console.error('Error creating token:', error.message);
      return;
    }
    const paymentToken = token.id;

    // Calling the function to create a payment method
    const createdPaymentMethod = await saveUserPayment(userID, paymentType, paymentToken, billingDetails);

    if (createdPaymentMethod) {
      const paymentInfo = getPaymentInfo();
      //const amount = paymentInfo.amount;
      const description = 'sample';
      await makeUserPayment(userID, amount, description, createdPaymentMethod.id);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}
