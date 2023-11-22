fetch('/api/reservations?userID=123456', {
  //mode: 'no-cors',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => {
    console.log('Data from server:', data);
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });
