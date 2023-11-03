
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
  try{
    const date = new Date(timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000);

    const options = {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
    };

    const formattedDate = date.toLocaleString(undefined, options);

    return formattedDate;
  }
  catch(err){
    return "";
  }
}

const customReservationLabelMapping = {
    // "User ID": "userID",
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

function viewReservation(reservationID) {
    const modal = document.getElementById("modalBody");
    fetch('/api/reservation?reservationID='+reservationID)
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
            const rowDiv = document.createElement("div");
            const checkInButton = document.createElement("button");
            const checkOutButton = document.createElement("button");
            checkInButton.textContent="Check In"
            checkOutButton.textContent="Check Out"
            checkInButton.classList.add("check-In-Button");
            checkOutButton.classList.add("check-Out-Button");
            rowDiv.appendChild(checkOutButton);
            rowDiv.appendChild(checkInButton);
            
            rowDiv.classList.add("row");
            modal.appendChild(rowDiv);

            // Initially, disable the "Check Out" button
            checkOutButton.disabled = true;
            checkOutButton.classList.add("disabled");

            // Add event listeners for the "Check In" and "Check Out" buttons
            checkInButton.addEventListener("click", function () {
                const confirmation = window.confirm("Are you sure you want to Check In?");
                if (confirmation) {
                    checkInButton.disabled = true;
                    checkInButton.classList.add("disabled");
                    checkOutButton.disabled = false;
                    checkOutButton.classList.remove("disabled");
                }
            });

            checkOutButton.addEventListener("click", function () {
                const confirmation = window.confirm("Are you sure you want to Check Out?");
                if (confirmation) {
                checkOutButton.disabled = true;
                checkOutButton.classList.add("disabled");
                }
            });

        });

    document.getElementById("myModal").style.display = "block";
}


document.getElementsByClassName("close")[0].onclick = function () {
    document.getElementById("myModal").style.display = "none";
}



document.addEventListener("DOMContentLoaded", () => {

    




    const searchInput = document.getElementById("search-input");
    const tableBody = document.getElementById("table-body");
    const modalBody = document.getElementById("modal-body");

    function displayReservations(userID) {
        fetch('/api/reservations?userID='+userID)
            .then((response) => response.json())
            .then((data) => {
                tableBody.innerHTML = "";

                data.data.forEach((reservation) => {
                    const row = document.createElement("tr");
                    row.innerHTML = `<td>${convertTimestampToDate(reservation.reservationCreatedTime)}</td><td>${convertTimestampToDate(reservation.startTime)}</td><td>${convertTimestampToDate(reservation.endTime)}</td><td><button id=${reservation.reservationID || 'N/A'} onclick=viewReservation(this.getAttribute('id'))>View</button></td>`;
                    tableBody.appendChild(row);

                });
            });
    }


    displayReservations('12345678');

    searchInput.addEventListener("input", () => {
        const searchValue = searchInput.value.toLowerCase();
        const rows = tableBody.getElementsByTagName("tr");

        for (let row of rows) {
            const name = row.cells[0].textContent.toLowerCase();
            const reservationId = row.cells[1].textContent.toLowerCase();
            if (name.includes(searchValue) || reservationId.includes(searchValue)) {
                row.style.display = "table-row";
            } else {
                row.style.display = "none";
            }
        }
    });

});

