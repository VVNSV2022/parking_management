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



function fun1() {
    alert('Request Approved');
    
    // Hide the tr1 row
    var tr1Row = document.getElementById('tr1');
    if (tr1Row) {
        tr1Row.hidden = 'true';
    }

    // Redisplay the table (you may need to customize this based on your needs)
    // redisplayTable();
}

function fun2() {
    alert('Request Denied');
    
    // Hide the tr1 row
    var tr1Row = document.getElementById('tr2');
    if (tr1Row) {
        tr1Row.hidden = 'true';
    }

    // Redisplay the table (you may need to customize this based on your needs)
    // redisplayTable();
}

