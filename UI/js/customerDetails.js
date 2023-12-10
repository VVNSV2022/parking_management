localStorage.setItem('userID','12345678');
localStorage.setItem('token','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyLTE3MDExODExNTU3ODgiLCJpYXQiOjE3MDIyNDczNTYsImV4cCI6MTcwMjI0ODI1Nn0.pvpFszY-NvFGLT3wTfzJzrHErXFYcwK-ZmzfCQW571U')
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
                        <strong>Username:</strong> <span>${userData.username}</span>
                    </div>
                    <div class="user-detail">
                        <strong>Email:</strong> <span>${userData.email}</span>
                    </div>
                    <div class="user-detail">
                        <strong>Date of Birth:</strong> <span>${userData.dateOfBirth}</span>
                    </div>
                    <div class="user-detail">
                        <strong>Is Disabled:</strong> <span>${userData.isDisabled}</span>
                    </div>
                    
                    <h2 class="address-heading">Current Address</h2>
                    <div class="user-detail">
                        <strong>Street:</strong> <span>${userData.address.streetNumber}</span>
                    </div>
                    <div class="user-detail">
                        <strong>City:</strong> <span>${userData.address.city}</span>
                    </div>
                    <div class="user-detail">
                        <strong>Apt Unit:</strong> <span>${userData.address.aptUnit}</span>
                    </div>
                    <div class="user-detail">
                        <strong>State:</strong> <span>${userData.address.state}</span>
                    </div>
                </div>
            </div>
            <button class="update-btn">Update</button>
        `;

        const userDetailItems = document.querySelectorAll('.user-detail');
        userDetailItems.forEach(item => {
            item.style.display = 'flex';
            item.style.alignItems = 'center';
            item.style.marginBottom = '10px';
        });

        const userDetailLabels = document.querySelectorAll('.user-detail strong');
        userDetailLabels.forEach(label => {
            label.style.minWidth = '120px'; // Set a minimum width for labels for uniform alignment
            label.style.marginRight = '10px'; // Add some margin between label and value
        });
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
        // updateButton.style.backgroundColor = '#6b6b9e';
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
        const token = localStorage.getItem('token');
        const membershipResponse = await fetch(`/api/user/memberships?userID=${userID}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
        });

        const membershipResult = await membershipResponse.json();
        const membershipData = membershipResult.data;

        let membershipInfo = '';
        if (membershipData && membershipData.length > 0) {
            membershipInfo = `
                <div class="membership-heading">
                    <h2>Memberships</h2>
                </div>
                <div class="membership-details">
                    ${membershipData.map(membership => {
                        const startDate = new Date(membership.startDate._seconds * 1000); // Convert seconds to milliseconds
                        const endDate = new Date(membership.endDate._seconds * 1000); // Convert seconds to milliseconds

                        const dateFormatter = new Intl.DateTimeFormat('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric',
                            second: 'numeric',
                            timeZoneName: 'short'
                        });
                        const formattedStartDate = dateFormatter.format(startDate);
                        const formattedEndDate = dateFormatter.format(endDate);

                        return `
                            <div class="membership-box">
                                <div class="membership-detail">
                                    <strong>Membership ID:</strong> <span>${membership.membershipID}</span>
                                </div>
                                <div class="membership-detail">
                                    <strong>Membership Type:</strong> <span>${membership.membershipType}</span>
                                </div>
                                <div class="membership-detail">
                                    <strong>Membership Period:</strong> <span>${membership.membershipPeriod}</span>
                                </div>
                                <div class="membership-detail">
                                    <strong>Start Date:</strong> <span>${formattedStartDate}</span>
                                </div>
                                <div class="membership-detail">
                                    <strong>End Date:</strong> <span>${formattedEndDate}</span>
                                </div>
                                <div class="membership-detail">
                                    <strong>Region ID:</strong> <span>${membership.regionID}</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>`;
        } else {
            membershipInfo = '<p>No Active memberships</p>';
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
        const vehiclesData = vehiclesResult.data;

        let vehiclesInfo = '';
        if (vehiclesData && vehiclesData.length > 0) {
            vehiclesInfo = `
                <div class="vehicle-details-container">
                    <h2 class="vehicle-details-heading">Vehicles</h2>
                    <div class="vehicle-details-content">
                        ${vehiclesData.map(vehicle => `
                            <div class="vehicle-detail">
                                <div class="vehicle-info">
                                    <span><strong>Vehicle Make:</strong> ${vehicle.vehicleMake}</span>
                                </div>
                                <div class="vehicle-info">
                                    <span><strong>Vehicle Model:</strong> ${vehicle.vehicleModel}</span>
                                </div>
                                <div class="vehicle-info">
                                    <span><strong>License Plate Number:</strong> ${vehicle.licensePlateNumber}</span>
                                </div>
                                <div class="vehicle-info">
                                    <span><strong>Vehicle Color:</strong> ${vehicle.vehicleColor}</span>
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

        const vehicleDetailsContent = document.querySelector('.vehicle-details-content');
        vehicleDetailsContent.style.display = 'flex';
        vehicleDetailsContent.style.flexWrap = 'wrap';
        vehicleDetailsContent.style.justifyContent = 'center';

        const vehicleInfos = document.querySelectorAll('.vehicle-info span');
        vehicleInfos.forEach(info => {
            info.style.display = 'block';
            info.style.border = '1px solid #ccc';
            info.style.borderRadius = '5px';
            info.style.padding = '8px';
            info.style.marginBottom = '5px';
            info.style.width = '100%';
        });

        const deleteButtons = document.querySelectorAll('.delete-btn');
        deleteButtons.forEach(button => {
            button.style.display = 'block';
            button.style.marginTop = '10px';
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

        const addButton = document.querySelector('.add-btn');
        addButton.style.marginTop = '20px';
        addButton.style.padding = '10px 20px';
        addButton.style.border = 'none';
        addButton.style.borderRadius = '5px';
        addButton.style.backgroundColor = '#6b6b9e';
        addButton.style.color = 'white';
        addButton.style.cursor = 'pointer';
        addButton.style.transition = 'background-color 0.3s';

        addButton.addEventListener('click', function() {
            window.location.href = '../screens/addVehicle.html';
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
