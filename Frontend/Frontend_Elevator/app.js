function handleLicensePlateButtonClick() {
    const licensePlate = prompt("Enter your License Plate Number:");

    if (licensePlate) {
        // Making an API request to check the license plate
        fetch('/api/elevator/scan-license-plate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ licensePlate: licensePlate })
        })
        .then(response => {
            if (response.status === 200) {
                // When reservation found, show success message and redirect to Reservations Page
                return response.json()
                    .then(data => {
                        alert(data.message);
                        window.location.href = 'home.html';
                    });
            } else if (response.status === 404) {
                // When no reservation found, show not found message and redirect to notFound.html
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

// Calling the rendering functions when the page loads
window.onload = function () {
    const licensePlateButton = document.getElementById("licensePlateButton");
    licensePlateButton.addEventListener("click", handleLicensePlateButtonClick);
};
