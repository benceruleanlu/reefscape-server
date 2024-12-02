const socket = new WebSocket('ws://localhost:3000');

socket.onopen = () => {
  console.log('Connected to server');
};

function addButton(li, type, studentNumber) {
  const button = document.createElement('button');
  button.className = 'btn-' + type;
  button.textContent = type;
  button.onclick = function () {
    socket.send(JSON.stringify({ studentNumber: studentNumber, accepted: (type === 'accept') }))
  }
  li.appendChild(button);
}

function addToQueue(studentNumber) {
  const queue = document.getElementById('queue');

  const li = document.createElement('li');
  li.id = li.textContent = studentNumber;
  queue.appendChild(li);

  addButton(li, 'accept', studentNumber);
  addButton(li, 'reject', studentNumber);
}

socket.onmessage = (event) => {
  console.log("data received")
  const data = JSON.parse(event.data);

  if (data.type === "ip") {
    const ip = document.getElementById('ip');
    ip.textContent = "Server IP is: " + data.ip;
  }
  else if (data.type === "all") {
    for (let i = 0; i < data.data.length; i++) {
      addToQueue(data.data[i]);
    }
  } else if (data.type === "add") {
    addToQueue(data.studentNumber);
  } else if (data.type === "del") {
    const li = document.getElementById(data.studentNumber);
    queue.removeChild(li);
  }
};

socket.onclose = () => {
  console.log('Disconnected from server');
};
