const headers = {
    authorization: 'Bearer 8bG72JkLsd92k3L8s91ldKk29sKsjL38Dlskfj29D'
  };
  

function sortTable(n) {
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = document.getElementById("reservations-table");
    switching = true;
    dir = "asc"; 
    while (switching) {
      switching = false;
      rows = table.rows;
      for (i = 1; i < (rows.length - 1); i++) {
        shouldSwitch = false;
        x = rows[i].getElementsByTagName("TD")[n];
        y = rows[i + 1].getElementsByTagName("TD")[n];
        if (dir == "asc") {
          if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
            shouldSwitch= true;
            break;
          }
        } else if (dir == "desc") {
          if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
            shouldSwitch = true;
            break;
          }
        }
      }
      if (shouldSwitch) {
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
        switchcount ++;      
      } else {
        if (switchcount == 0 && dir == "asc") {
          dir = "desc";
          switching = true;
        }
      }
    }
  }

function convertTimestampToDate(timestamp) {
    try
    {const date = new Date(timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000);

    const options = {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
    };
    const formattedDate = date.toLocaleString(undefined, options);

    return formattedDate;}
    catch(err){
        return "";
    }
}

const customReservationLabelMapping = {
    "User ID": "userID",
    "Reservation ID": "reservationID",
    "Reservation Date": "reservationCreatedTime",
    "Parking Spot": "parkingSpot",
    "Price": "price",
    "Payment ID": "paymentID",
    "Start Time": "startTime",
    "End Time": "endTime",
    "Vehicle ID": "vehicleID",
    "Payment Status": "paymentStatus",
    "Parking Lot ID": "parkingLotID",
    "Reservation Status": "reservationStatus",
};


function cancelReservation(reservationID,userID) {
    // console.log(JSON.stringify({ reservationID: reservationID,userID:userID }));
    fetch('/api/reservation', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer 8bG72JkLsd92k3L8s91ldKk29sKsjL38Dlskfj29D'
        },
        body: JSON.stringify({ reservationID: reservationID,userID:userID })
        
    })
        .then((response) => {
            if (response.status === 200) {
                alert("Reservation canceled successfully!");
                // Optionally, you can update the UI or perform any other actions after successful cancellation.
            } else {
                alert("Failed to cancel reservation. Please try again.");
            }
        })
        .catch((error) => {
            console.error("Error during reservation cancellation:", error);
            alert("An error occurred during reservation cancellation.");
        })
        .finally(() => {
            // Optionally, you can perform cleanup or update the UI regardless of success or failure.
        });
}


function viewReservation(reservationID,userID) {
    const modal = document.getElementById("modalBody");
    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel Reservation";
    cancelBtn.classList.add("cancelbtn");
    cancelBtn.addEventListener("click", () => {
        const confirmation = confirm("Are you sure you want to cancel this reservation?");
        if (confirmation) {
            cancelReservation(reservationID,userID);
        }
    });
    fetch('/api/reservation?reservationID='+reservationID, { headers })
        .then((response) => response.json())
        .then((data) => {
            modal.innerHTML = "";
            for (const customLabel in customReservationLabelMapping) {
                if (customReservationLabelMapping.hasOwnProperty(customLabel)) {
                    const key = customReservationLabelMapping[customLabel];
                    const rowDiv = document.createElement("div");
                    const labelDiv = document.createElement("div");
                    const inputDiv = document.createElement("div");
                    
                    const label = document.createElement("label");
                    label.textContent = customLabel;

                    const input = document.createElement("input");
                    

                    input.setAttribute("type", "text");
                    if (key=="reservationCreatedTime" || key=="startTime" || key=="endTime")
                    {
                        console.log(key,data.data[0][key]);
                        input.setAttribute("value", convertTimestampToDate(data.data[0][key]));
                    }
                    else{
                        input.setAttribute("value", data.data[0][key] || "");
                    }
                    
                    input.setAttribute("readonly", "true"); 

                    labelDiv.appendChild(label);
                    inputDiv.appendChild(input);
                    labelDiv.classList.add("col-25");
                    inputDiv.classList.add("col-75");
                    rowDiv.appendChild(labelDiv);
                    rowDiv.appendChild(inputDiv);

                    rowDiv.classList.add("row");

                    modal.appendChild(rowDiv);
                }
            }
            modal.appendChild(cancelBtn);
        });

    document.getElementById("myModal").style.display = "block";
}


document.getElementsByClassName("close")[0].onclick = function () {
    document.getElementById("myModal").style.display = "none";
}



document.addEventListener("DOMContentLoaded", () => {

    // const currentURL = window.location.href;
    // if (currentURL.includes('/home.html')) {
    //     document.getElementById('home-link').classList.add('active');
    // } else if (currentURL.includes('/reservation.html')) {
    //     document.getElementById('reservation-link').classList.add('active');
    // }





    const searchInput = document.getElementById("search-input");
    const tableBody = document.getElementById("table-body");
    const modalBody = document.getElementById("modal-body");

    function displayReservations() {
        fetch('/api/allreservations', { headers})
            .then((response) => response.json())
            .then((data) => {
                tableBody.innerHTML = "";

                data.data.forEach((reservation) => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
    <td>${reservation.reservationID || ""}</td>
    <td>${reservation.userID || ""}</td>
    <td>${convertTimestampToDate(reservation.reservationCreatedTime)}</td>
    <td>${convertTimestampToDate(reservation.startTime)}</td>
    <td>${convertTimestampToDate(reservation.endTime)}</td>
    <td>${reservation.reservationStatus || ""}</td>
    <td>
        <button class='btn' Vid="${reservation.reservationID || "N/A"}" VuserId="${reservation.userID || ""}" onclick="viewReservation(this.getAttribute('Vid'), this.getAttribute('VuserId'))">View</button>
    </td>`;

// Check if reservation status is 'complete' before adding the "Bill" button
if (reservation.reservationStatus === 'complete') {
    // Create the "Bill" button element
    var billButton = document.createElement('button');
    billButton.className = 'btn';
    billButton.id = reservation.reservationID || "N/A";
    billButton.userId = reservation.userID || "";
    billButton.innerText = 'Bill';
    billButton.onclick = function() {
        billReservation(this.id, this.userId);
    };

    // Append the "Bill" button to the row
    var actionsCell = row.querySelector('td:last-child');
    actionsCell.appendChild(billButton);
}
tableBody.appendChild(row);

                });
            });
    }


    displayReservations();

    // Update the search logic for date fields
    searchInput.addEventListener("input", () => {
        const searchValue = searchInput.value.trim().toLowerCase(); // Convert to lowercase and remove leading/trailing spaces
        const rows = tableBody.getElementsByTagName("tr");
    
        const searchFields = [0, 1, 2, 3, 4, 5]; // Indices of columns to be searched
    
        for (let row of rows) {
            let rowVisible = false;
    
            // Check each cell in the row for specified columns
            for (let i of searchFields) {
                // const cellValue = i === 2 || i === 3 || i === 4 // Check if it's a date column
                //     ? convertTimestampToDate(row.cells[i].textContent).toLowerCase()
                //     : row.cells[i].textContent.toLowerCase();
                    const cellValue = row.cells[i].textContent.toLowerCase()
                    console.log(cellValue);
    
                // Check if the cell content starts with the search value
                if (cellValue.startsWith(searchValue)) {
                    rowVisible = true;
                    break;
                }
            }
    
            // Set display style based on row visibility
            row.style.display = rowVisible ? "table-row" : "none";
        }
    });
    



});

