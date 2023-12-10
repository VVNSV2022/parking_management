let userID;
let accessToken;
let amount;
let stripe;
let elements;
let cardElement;
let formData;

document.addEventListener('DOMContentLoaded', async () => {
  try {
    userID = localStorage.getItem('userID');
    accessToken = localStorage.getItem('accessToken');
    populateSavedCards(userID, accessToken);
    formData = JSON.parse(localStorage.getItem('reservationData'));
    amount = formData.cost;
    initStripe();
    //console.log(formData.parkingLotID);
    document.getElementById('amount').innerText = amount.toFixed(2); 
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

      // Adding saved cards to the dropdown
      result.data.forEach((element, index) => {
        const option = document.createElement('option');
        option.value = element.card.id;
        const paymentdisplay = element.card.last4;
        option.text = `Last 4 digits : ${paymentdisplay}`;
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
        'Content-Type': 'application/json', 
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
      billing_details: billingDetails,
    });

    if (error) {
      console.error('Error creating Payment Method:', error.message);
      return;
    } else {
      console.log('Payment Method created successfully:', paymentMethod);
    }
    const paymentMethodID = paymentMethod.id;  // Here, paymentMethod.id represents the Payment Method ID
    console.log(paymentMethodID)
    console.log(amount)
    makeReservationAfterPayment(userID, paymentMethodID, formData, paymentType);

  } catch (error) {
    console.error('Error:', error.message);
    alert('Transaction failed. Please try again.');
  }
}

async function makeReservationAfterPayment(userID, paymentMethodID, formData, paymentType) { // Here I am Fetching the reservation data from MakeReservation.js
  const startTime = formData.startTime;
  const endTime = formData.endTime;
  const parkingLotID = formData.parkingLotID;
  const permitType = formData.permitType;
  const vehicleID = formData.vehicleID;
  const isMembership = true;
  const paymentMethod = "New"
  console.log(startTime);
  console.log(endTime);
  console.log(vehicleID);
  console.log(parkingLotID);

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
        paymentMethodID,
        paymentType,
        paymentMethod,
        isMembership,
      }),
    });
    const result = await response.json();

    if (response.ok) {
      console.log('Reservation created successfully:', result);
      alert('Reservation done successfully.');
      window.location.href = 'customerDetails.html'; //Redirecting to the home page
    } else {
      console.error('Error creating reservation:', result.message);
    }
  } catch (error) {
    console.error('Error creating reservation:', error.message);
  }
}