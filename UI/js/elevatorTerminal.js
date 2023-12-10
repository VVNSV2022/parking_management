const accessToken = localStorage.getItem('accessToken');

function handleLicensePlateButtonClick() {
    const licensePlateInput = document.getElementById("licenseInput").value;

    if (licensePlateInput) {
        // Making an API request to check the license plate
        fetch('/api/elevator/scan-license-plate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`, 
            },
            body: JSON.stringify({ licensePlate: licensePlateInput })

        })
        .then(response => {
            if (response.status === 200) {
                // When license plate found, we show success message and redirect to Reservations Page
                return response.json()
                    .then(data => {
                        alert("Checking Successfully Initialted - Redirecting to the home page");
                        window.location.href = '../index.html';
                    });
            } else if (response.status === 404) {
                // When license plate not found, we show not found message and redirect to notFound.html
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

window.onload = function () {
    const licenseSubmitButton = document.getElementById("licenseSubmitButton");
    licenseSubmitButton.addEventListener("click", handleLicensePlateButtonClick);
};
