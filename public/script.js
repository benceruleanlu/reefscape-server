const socket = new WebSocket('ws://localhost:3000');

socket.onopen = () => {
  console.log('Connected to server');
};

socket.onmessage = (event) => {
  console.log("data received")
  const data = JSON.parse(event.data);

  const queue = document.getElementById('queue');
  if (data.type === "all") {
    for (let i = 0; i < data.data.length; i++) {
      const li = document.createElement('li');
      li.id = li.textContent = data.data[i];
      queue.appendChild(li);
    }
  } else if (data.type === "add") {
    const li = document.createElement('li');
    li.id = li.textContent = data.studentNumber;
    queue.appendChild(li);
  } else if (data.type === "del") {
    const li = document.getElementById(data.studentNumber);
    queue.removeChild(li);
  }
};

socket.onclose = () => {
  console.log('Disconnected from server');
};
