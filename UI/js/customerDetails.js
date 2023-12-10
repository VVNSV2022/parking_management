localStorage.setItem('userID','12345678');
localStorage.setItem('token','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyLTE3MDExODExNTU3ODgiLCJpYXQiOjE3MDIyMjk0MTYsImV4cCI6MTcwMjIzMDMxNn0.yTUDyWEmss4A6vvwqrERxpDntd-GuKCyq-nhIhT4Z2o');
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
          <div class="personal-details-container">
            <h2 class="personal-details-heading">Personal Details</h2>
            <div class="user-details">
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
                <strong>Is Disabled:</strong> ${userData.isDisabled}
              </div>
              
              <h2 class="address-heading">Current Address</h2>
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
            </div>
          </div>
          <button class="update-btn">Update</button>
        `;

        const personalDetailsContainer = document.querySelector('.personal-details-container');
        personalDetailsContainer.style.backgroundColor = '#6b6b9e';
        personalDetailsContainer.style.color = '#fff';
        personalDetailsContainer.style.borderRadius = '10px';
        personalDetailsContainer.style.padding = '20px';
        personalDetailsContainer.style.textAlign = 'center';

        const personalDetailsHeading = document.querySelector('.personal-details-heading');
        personalDetailsHeading.style.marginTop = '0';
        personalDetailsHeading.style.fontSize = '24px';

        const addressHeading = document.querySelector('.address-heading');
        addressHeading.style.marginTop = '30px'; // Adjust spacing between sections

        const updateButton = document.querySelector('.update-btn');
        updateButton.style.backgroundColor = '#6b6b9e';
        updateButton.style.color = '#fff';
        updateButton.style.border = 'none';
        updateButton.style.borderRadius = '5px';
        updateButton.style.padding = '10px 20px';
        updateButton.style.cursor = 'pointer';
        updateButton.style.transition = 'background-color 0.3s';
        updateButton.style.marginTop = '20px'; // Adjust spacing from user details

        updateButton.addEventListener('click', function() {
          window.location.href = '../screens/updateProfile.html';
        });
    } catch (error) {
      console.error('Error fetching user details:', error);
      contentDiv.innerHTML = '<p>Error fetching user details. Please try again later.</p>';
    }
  });

  membershipLink.addEventListener('click', async function(event) {
    event.preventDefault();
    try {
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
      const token = localStorage.getItem('token');
      const vehiclesResponse = await fetch(`/api/vehicles?userID=${userID}`,{
        headers: {
                'Authorization': `Bearer ${token}`
        },
      });
      const vehiclesResult = await vehiclesResponse.json();
      const vehiclesData=vehiclesResult.data;
      console.log(vehiclesData);

      // Display vehicles data
       let vehiclesInfo = '';
        if (vehiclesData && vehiclesData.length > 0) {
           vehiclesInfo = vehiclesInfo = `
                <div class="vehicle-details-container">
                    <h2 class="vehicle-details-heading">Vehicles</h2>
                    <div class="vehicle-details-content">
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
                    </div>
                </div>
                <button class="add-btn">Add</button>`;
        } else {
          vehiclesInfo = `<p>No vehicles found</p>
            <div class="vehicle-buttons">
              <button class="add-btn">Add</button>
            </div>`;
        }
        contentDiv.innerHTML = vehiclesInfo;

        const vehicleDetailsContainer = document.querySelector('.vehicle-details-container');
        // vehicleDetailsContainer.style.backgroundColor = '#6b6b9e';
        // vehicleDetailsContainer.style.color = '#fff';
        vehicleDetailsContainer.style.borderRadius = '10px';
        vehicleDetailsContainer.style.padding = '20px';
        vehicleDetailsContainer.style.textAlign = 'center';

        const vehicleDetailsHeading = document.querySelector('.vehicle-details-heading');
        vehicleDetailsHeading.style.marginTop = '0';
        vehicleDetailsHeading.style.fontSize = '24px';
        vehicleDetailsHeading.style.backgroundColor = '#8a8acc';
        vehicleDetailsHeading.style.color = '#fff';
        vehicleDetailsHeading.style.borderRadius = '8px';
        vehicleDetailsHeading.style.padding = '10px 20px';
        vehicleDetailsHeading.style.textAlign = 'center';
        vehicleDetailsHeading.style.display = 'inline-block';
        vehicleDetailsHeading.style.border = '2px solid #8a8acc';

        const addButton = document.querySelector('.add-btn');
        addButton.style.backgroundColor = '#6b6b9e';
        addButton.style.color = '#fff';
        addButton.style.border = 'none';
        addButton.style.borderRadius = '5px';
        addButton.style.padding = '10px 20px';
        addButton.style.cursor = 'pointer';
        addButton.style.transition = 'background-color 0.3s';
        addButton.style.marginTop = '20px';

        addButton.addEventListener('click', function() {
          window.location.href = '../screens/addVehicle.html';
        });

        const deleteButtons = document.querySelectorAll('.delete-btn');
        deleteButtons.forEach(button => {
          button.style.display = 'block';
          button.style.marginTop = '10px';
          button.style.backgroundColor = '#8a8acc';
          button.style.color = '#fff';
          button.style.border = 'none';
          button.style.borderRadius = '5px';
          button.style.padding = '8px 16px';
          button.style.cursor = 'pointer';
          button.style.transition = 'background-color 0.3s';
        });

        deleteButtons.forEach(deleteButton => {
          deleteButton.addEventListener('click', async function() {
            const vehicleID = deleteButton.getAttribute('data-vehicle-id');
            try {
              const response = await fetch(`/api/vehicle?vehicleID=${vehicleID}&userID=${userID}`, {
                headers: {
                  'Authorization': `Bearer ${token}`
                },
                method: 'DELETE'
              });
              if (response.ok) {
                deleteButton.closest('.vehicle-detail').style.display = 'none';
              } else {
                console.error('Failed to delete vehicle');
              }
            } catch (error) {
              console.error('Error deleting vehicle:', error);
            }
          });
        });

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

        const paymentResponse = await fetch(`/payments/?userID=${userID}`, {
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
                </div>
                <button class="add-payment-btn">Add</button>`;
        } else {
            paymentInfo = `<p>No payment methods found</p>
                <div class="payment-buttons">
                    <button class="add-payment-btn">Add</button>
                </div>`;
        }

        contentDiv.innerHTML = paymentInfo;

        const addButton = document.querySelector('.add-payment-btn');
        addButton.addEventListener('click', function() {
            window.location.href = '../screens/customerAddPaymentMethod.html';
        });

        const deleteButtons = document.querySelectorAll('.delete-payment-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', async function() {
                try {
                    let paymentMethodID = button.getAttribute('data-payment-id');
                    reqBody = {
                        userID,
                        paymentMethodID
                    };
                    const response = await fetch(`/payments/delete`, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        method: 'DELETE',
                        body: JSON.stringify(reqBody)
                    });
                    if (response.ok) {
                        button.closest('.payment-detail').style.display = 'none';
                    } else {
                        console.error('Failed to delete payment method');
                    }
                } catch (error) {
                    console.error('Error deleting payment method:', error);
                }
            });
        });
    } catch (error) {
        console.error('Error fetching payment methods:', error);
        contentDiv.innerHTML = '<p>Error fetching payment methods. Please try again later.</p>';
    }
});
})
