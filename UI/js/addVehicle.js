try {
    document.addEventListener('DOMContentLoaded', function () {
        const vehicleForm = document.getElementById('vehicleForm');
        if (vehicleForm) {
            vehicleForm.addEventListener('submit', async function(event) {
                try {
                    event.preventDefault(); // Prevents the default form submission
                    console.log("Submit button clicked");

                    const contentDiv = document.getElementById('content');
                    const userID = localStorage.getItem('userID');
                    const token = localStorage.getItem('token');
                    const vehicleData = {
                        userID,
                        licensePlateNumber: document.getElementById('licensePlateNumber').value,
                        vehicleMake: document.getElementById('vehicleMake').value,
                        vehicleModel: document.getElementById('vehicleModel').value,
                        vehicleColor: document.getElementById('vehicleColor').value,
                        vehicleYear: document.getElementById('vehicleYear').value,
                        VIN: document.getElementById('VIN').value,
                        ownersName: document.getElementById('ownersName').value,
                        isVehicleInsured: document.getElementById('isVehicleInsured').checked,
                        isRental: document.getElementById('isRental').checked,
                    };

                    const response = await fetch('/api/vehicle', {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                        method: 'POST',
                        body: JSON.stringify(vehicleData),
                    });

                    if (response.ok) {
                        alert('Added vehicle successfully!');
                        window.location.href = '../screens/customerDetails.html';
                    } else {
                        document.getElementById('result').innerHTML = '<p>Failed to add vehicle. Please try again later.</p>';
                    }
                } catch (error) {
                    console.error('Error within form submission:', error);
                    document.getElementById('result').innerHTML = '<p>Error adding vehicle. Please try again later.</p>';
                }
            });
        } else {
            console.error('Vehicle form not found.');
        }
    });
} catch (error) {
    console.error('Error attaching event listener:', error);
}

