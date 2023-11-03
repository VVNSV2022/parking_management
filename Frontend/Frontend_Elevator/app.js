function handleLicensePlateButtonClick() {
<<<<<<< HEAD
    const licensePlateInput = document.getElementById("licenseInput").value;

    if (licensePlateInput) {
        // Making an API request to check the license plate
=======
    const licensePlate = prompt("Enter your License Plate Number:");

    if (licensePlate) {
        // Make an API request to check the license plate
>>>>>>> 9e7eb84 (Customer subgroup commit)
        fetch('/api/elevator/scan-license-plate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
<<<<<<< HEAD
            body: JSON.stringify({ licensePlate: licensePlateInput })
        })
        .then(response => {
            if (response.status === 200) {
                // When license plate found, we show success message and redirect to Reservations Page
=======
            body: JSON.stringify({ licensePlate: licensePlate })
        })
        .then(response => {
            if (response.status === 200) {
                // Reservation found, show success message and redirect to home.html
>>>>>>> 9e7eb84 (Customer subgroup commit)
                return response.json()
                    .then(data => {
                        alert(data.message);
                        window.location.href = 'home.html';
                    });
            } else if (response.status === 404) {
<<<<<<< HEAD
                // When license plate not found, we show not found message and redirect to notFound.html
=======
                // No reservation found, show not found message and redirect to notFound.html
>>>>>>> 9e7eb84 (Customer subgroup commit)
                return response.json()
                    .then(data => {
                        alert(data.message);
                        window.location.href = 'notFound.html';
                    });
            } else {
                alert('Unexpected error. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
}

<<<<<<< HEAD
// Calling the rendering functions when the page loads
window.onload = function () {
    const licenseSubmitButton = document.getElementById("licenseSubmitButton");
    licenseSubmitButton.addEventListener("click", handleLicensePlateButtonClick);
=======
// Call the rendering functions when the page loads
window.onload = function () {
    const licensePlateButton = document.getElementById("licensePlateButton");
    licensePlateButton.addEventListener("click", handleLicensePlateButtonClick);
>>>>>>> 9e7eb84 (Customer subgroup commit)
};
