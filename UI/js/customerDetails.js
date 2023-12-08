import { displayUpdateForm } from './updateProfile.js';
import { displayAddVehicleForm } from './addVehicle.js';

document.addEventListener("DOMContentLoaded", function() {
  const contentDiv = document.getElementById('content');
  const profileLink = document.getElementById('profileLink');
  const membershipLink = document.getElementById('membershipLink');
  const vehiclesLink = document.getElementById('vehiclesLink');
  const paymentmethodsLink = document.getElementById('paymentmethodsLink');

  profileLink.addEventListener('click', async function(event) {
    event.preventDefault();
    try {
      const userID = localStorage.getItem('userID');
      const response = await fetch(`/api/customer?userID=${userID}`);
      const userData = await response.json();

      contentDiv.innerHTML = `
        <div class="user-details">
          <h2>Personal Details</h2>
          <div class="user-detail">
            <strong>Username:</strong> ${userData.username}
          </div>
          <div class="user-detail">
            <strong>Email:</strong> ${userData.email}
          </div>
          <div class="user-detail">
            <strong>Date of Birth:</strong> ${userData.dateOfBirth}
          </div>
          <div class="user-detail">
            <strong>Phone Number:</strong> ${userData.phoneNumber}
          </div>
          <div class="user-detail">
            <strong>Is Disabled:</strong> ${userData.isDisabled}
          </div>
        
          <h2>Current Address</h2>
          <div class="user-detail">
            <strong>Street:</strong> ${userData.address.streetNumber}
          </div>
          <div class="user-detail">
            <strong>City:</strong> ${userData.address.city}
          </div>
          <div class="user-detail">
            <strong>Apt Unit:</strong> ${userData.address.aptUnit}
          </div>
          <div class="user-detail">
            <strong>State:</strong> ${userData.address.state}
          </div>

          <button class="update-btn">Update</button>
        </div>`;
        
        const updateButton = document.querySelector('.update-btn');
        updateButton.addEventListener('click', function() {
          displayUpdateForm(userData, userID);
        });
    } catch (error) {
      console.error('Error fetching user details:', error);
      contentDiv.innerHTML = '<p>Error fetching user details. Please try again later.</p>';
    }
  });

  membershipLink.addEventListener('click', async function(event) {
    event.preventDefault();
    try {
      const userEmail = localStorage.getItem('userEmail');
      const userID = localStorage.getItem('userID');
      const membershipResponse = await fetch(`/user/membership?userID=${userID}`);
      const membershipData = await membershipResponse.json();

      let membershipInfo = '';
        if (membershipData) {
        membershipInfo = `
            <div class="membership-details">
            <h2>Membership Details</h2>
            <div class="membership-detail">
                <strong>Membership ID:</strong> ${membershipData.membershipID}
            </div>
            <div class="membership-detail">
                <strong>Membership Type:</strong> ${membershipData.membershipType}
            </div>
            <div class="membership-detail">
                <strong>Membership Period:</strong> ${membershipData.membershipPeriod}
            </div>
            <div class="membership-detail">
                <strong>Start Date:</strong> ${membershipData.startDate}
            </div>
            <div class="membership-detail">
                <strong>End Date:</strong> ${membershipData.endDate}
            </div>
            <div class="membership-detail">
                <strong>Region ID:</strong> ${membershipData.regionID}
            </div>
            </div>
        `;
        } else {
        membershipInfo = '<p>No Active membership</p>';
        }
      contentDiv.innerHTML = membershipInfo;
    } catch (error) {
      console.error('Error fetching membership details:', error);
      contentDiv.innerHTML = '<p>Error fetching membership details. Please try again later.</p>';
    }
  });

  vehiclesLink.addEventListener('click', async function(event) {
    event.preventDefault();
    try {
      const userID = localStorage.getItem('userID');
      const vehiclesResponse = await fetch(`api/vehicles?userID=${userID}`);
      const vehiclesData = await vehiclesResponse.json();

      // Display vehicles data
      let vehiclesInfo = '';
      if (vehiclesData && vehiclesData.length > 0) {
        vehiclesInfo = `
          <div class="vehicle-details">
            <h2>Vehicles</h2>
            ${vehiclesData.map(vehicle => `
              <div class="vehicle-detail">
                <div class="vehicle-info">
                  <strong>Vehicle Make:</strong> ${vehicle.vehicleMake}
                </div>
                <div class="vehicle-info">
                  <strong>Vehicle Model:</strong> ${vehicle.vehicleModel}
                </div>
                <div class="vehicle-info">
                  <strong>License Plate Number:</strong> ${vehicle.licensePlateNumber}
                </div>
                <div class="vehicle-info">
                  <strong>Vehicle Color:</strong> ${vehicle.vehicleColor}
                </div>
                <button class="delete-btn" data-vehicle-id="${vehicle.vehicleID}">Delete</button>
              </div>
            `).join('')}
            <div class="vehicle-buttons">
              <button class="add-btn">Add</button>
            </div>
          </div>`;

          const addButton = document.querySelector('.add-btn');
          addButton.addEventListener('click', function() {
            displayAddVehicleForm();
          });

          const deleteButtons = document.querySelectorAll('.delete-btn');
          deleteButtons.forEach(button => {
            button.addEventListener('click', async function() {
              const vehicleID = button.getAttribute('data-vehicle-id');
              try {
                const response = await fetch(`/api/vehicle/${vehicleID,userID}`, {
                  method: 'DELETE'
                });
                if (response.ok) {
                  button.parentElement.style.display = 'none'; // Hide the deleted vehicle
                } else {
                  // Handle deletion failure
                  console.error('Failed to delete vehicle');
                }
              } catch (error) {
                console.error('Error deleting vehicle:', error);
              }
            });
          });

      } else {
        vehiclesInfo = '<p>No vehicles found</p>';
      } 
      contentDiv.innerHTML = vehiclesInfo;
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      contentDiv.innerHTML = '<p>Error fetching vehicles. Please try again later.</p>';
    }
  });

  paymentmethodsLink.addEventListener('click', async function(event) {
    event.preventDefault();
    try {
      const userID = localStorage.getItem('userID');
      const token = localStorage.getItem('token'); // Assuming the token is stored in localStorage

      const paymentResponse = await fetch(`/payments?userID=${userID}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const paymentMethodDetails = await paymentResponse.json();
      const paymentData = paymentMethodDetails.data;

      let paymentInfo = '';
      if (paymentData && paymentData.length > 0) {
        paymentInfo = `
          <div class="payment-details">
            <h2>Payment Methods</h2>
            ${paymentData.map(payment => `
              <div class="payment-detail">
                <div class="payment-info">
                  <strong>Last 4 Digits:</strong> ${payment.card.last4}
                </div>
                <div class="payment-buttons">
                  <button class="delete-payment-btn" data-payment-id="${payment.id}">Delete</button>
                </div>
              </div>
            `).join('')}
            <div class="payment-buttons">
              <button class="add-payment-btn">Add</button>
            </div>
          </div>`;

        const addButton = document.querySelector('.add-payment-btn');
        addButton.addEventListener('click', function() {
          // Execute function from addPaymentMethod.js
          window.location.href = '../screens/customerAddPaymentMethod.html'; // Redirect to customerAddPaymentMethod.html
        });

        const deleteButtons = document.querySelectorAll('.delete-payment-btn');
        deleteButtons.forEach(button => {
          button.addEventListener('click', async function() {
            try {
                let paymentMethodID=button.getAttribute('data-payment-id');
                const response = await fetch(`/payments/delete/`, {
                   headers: {
                    'Authorization': `Bearer ${token}`
                   },
                  method: 'DELETE',
                  body:JSON.stringify({userID,paymentMethodID})
                });
                if (response.ok) {
                  button.parentElement.style.display = 'none'; // Hide the deleted payment method
                } else {
                  // Handle deletion failure
                  console.error('Failed to delete payment method');
                }
              } catch (error) {
                console.error('Error deleting vehicle:', error);
              }
          });
        });
    } else {
      paymentInfo = '<p>No payment methods found</p>';
    } 
    contentDiv.innerHTML = paymentInfo;
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    contentDiv.innerHTML = '<p>Error fetching payment methods. Please try again later.</p>';
  }
})
})
