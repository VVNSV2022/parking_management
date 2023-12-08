let userID;
let accessToken;
const amount = 5
let stripe;
let elements;
let cardElement;
localStorage.setItem('accessToken', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyLTE3MDExODExNTU3ODgiLCJpYXQiOjE3MDIwNjQ0MjksImV4cCI6MTcwMjA2NTMyOX0.85WOSs_A8K2flJLmygE2yEkJupdFXVpY2Xum3tcJwQs');

document.addEventListener('DOMContentLoaded', async () => {
  try {
    userID = localStorage.getItem('userID');
    accessToken = localStorage.getItem('accessToken');
    populateSavedCards(userID, accessToken);
    initStripe();
  } catch (error) {
    console.error('Error:', error.message);
  }
});

function initStripe() {
  stripe = Stripe('pk_test_51O5BKpIML3jMLAcettZqNVnL1vsrfiNDEevn85N5pAKJdhKcGdIBL65tXBI6K9pf2ZQr4Mr2nos18TNPyOkq6tU700jTjo4Kjw');
  elements = stripe.elements();
  var cardElementStyle = {
    base: {
      fontSize: '13px',
    },
    invalid: {
      iconColor: '#FF0000',
      color: '#FF0000',
    },
  };

  cardElement = elements.create('card', { style: cardElementStyle });
  cardElement.mount('#cardElement');
}


async function populateSavedCards(userID, accessToken) {
  const savedCardDropdown = document.getElementById('saved-card-dropdown');
  try {
    const result = await getUserPayment(userID, accessToken);

    //Here I am Checking if the result.data is present or not
    if (result.data || result.data ==null) {
      console.log(result.data);

      savedCardDropdown.innerHTML = '';
      const defaultOption = document.createElement('option');
      defaultOption.text = 'Select a payment option';
      savedCardDropdown.add(defaultOption);

      // Add saved cards to the dropdown
      result.data.forEach((element, index) => {
        const option = document.createElement('option');
        option.value = element.card.id;
        const paymentdisplay = element.card.last4;
        option.text = `Payment Method ID: ${paymentdisplay}`;
        savedCardDropdown.add(option);
      });
    } else {
      console.log('No data found in result');
    }
  } catch (error) {
    console.error('Error fetching saved cards:', error.message);
  }
}


// Save user's payment method
async function saveUserPayment(userID, paymentType, paymentMethodID, billingDetails, accessToken) {
  try {
    const response = await fetch('/payments/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`, 
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
async function makeUserPayment(userID, amount, description, savedPaymentMethodID, accessToken) {
  try {
    const response = await fetch('http://localhost:4000/payments/makePayment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        userID: userID,
        amount: amount,
        description: description,
        newPaymentMethodID: savedPaymentMethodID,
        savePaymentMethodID: "",
        newPaymentMethodType: "card"
      }),
    });

    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Get user's saved payment methods
async function getUserPayment(userID, accessToken) {
  try {
    const response = await fetch(`/payments/?userID=${userID}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',  // Include other headers as needed
      },
    });
    const result = await response.json();
    return result; 
  } catch (error) {
    console.error('Error:', error.message);
    return []; 
  }
}

function handlePayment() {
  event.preventDefault();
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
  console.log(userID)
  console.log('Billing Details:', billingDetails);
  handlePaymentMethod(userID, paymentType, billingDetails, accessToken);
}

function handleRepeatPayment() {
  const savedCardDropdown = document.getElementById('saved-card-dropdown');
  const savedPaymentMethodID = savedCardDropdown.value;
  makeUserPayment(userID, amount, "sample", savedPaymentMethodID, accessToken);
}

async function handlePaymentMethod(userID, paymentType, billingDetails, accessToken) {
  try {
    const { paymentMethod, error } = await stripe.createPaymentMethod({
      type: paymentType,
      card: cardElement,
      billing_details: billingDetails, // Assuming billingDetails has the card information
    });

    if (error) {
      console.error('Error creating Payment Method:', error.message);
      return;
    } else {
      console.log('Payment Method created successfully:', paymentMethod);
    }

    // Here, paymentMethod.id represents the Payment Method ID
    const paymentMethodID = paymentMethod.id;
    console.log(paymentMethodID)
    // await saveUserPayment(userID, paymentType, paymentMethodID, billingDetails, accessToken);
    const amount = 5;
    const description = 'sample2';
    await makeUserPayment(userID, amount, description, paymentMethodID, accessToken);
    alert('Transaction successful!');

    makeReservationAfterPayment(userID, paymentMethodID);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function makeReservationAfterPayment(userID, paymentID) {
  // Fetching reservation data from the form
  const startTime = document.getElementById('start-time').value; 
  const endTime = document.getElementById('end-time').value; 
  const parkingLotID = document.getElementById('parking-lot-id').value; 
  const permitType = document.getElementById('permit-type').value; 
  const vehicleID = document.getElementById('vehicle-id').value; 
  const isMembership = true

  try {
    const response = await fetch('/api/reservation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        userID,
        startTime,
        endTime,
        parkingLotID,
        permitType,
        vehicleID,
        paymentID,
        paymentType,
        paymentMethod,
        isMembership,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      console.log('Reservation created successfully:', result);
      alert('Reservation done successfully.');
    } else {
      console.error('Error creating reservation:', result.message);
    }
  } catch (error) {
    console.error('Error creating reservation:', error.message);
  }
}