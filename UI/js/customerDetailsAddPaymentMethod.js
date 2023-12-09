let userID;
let token;
let stripe;
let elements;
let cardElement;

document.addEventListener('DOMContentLoaded', async () => {
  try {
    userID = localStorage.getItem('userID');
    token = localStorage.getItem('token');
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
  handlePaymentMethod(userID, paymentType, billingDetails, token);
}

async function handlePaymentMethod(userID, paymentType, billingDetails, token) {
  try {
    // Using billing details to create a Payment Method
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

    try {
      const response = await fetch('/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
        },
        body: JSON.stringify({
          userID: userID,
          paymentType: paymentType,
          paymentMethodID: paymentMethodID,
          BillingDetails: billingDetails,
        }),
      });

      const result = await response.json();
      console.log(result);
    } catch (error) {
      console.error('Error:', error.message);
    }
} catch (error) {
    console.error('Error:', error.message);
  }
}

