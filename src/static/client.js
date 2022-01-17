const socket = io();

const canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const context = canvas.getContext('2d');
const radius = 10;

// form.addEventListener('submit', function (e) {
//     e.preventDefault();
//     if (input.value) {
//         socket.emit('chat message', input.value);
//         input.value = '';
//     }
// });

socket.on('coords', function (data) {
    context.clearRect(0, 0, canvas.width, canvas.height);

    console.log(data)
    console.log(canvas.width * data.x)
    context.beginPath();
    context.arc(canvas.width * data.x, canvas.height * data.y, radius, 0, 2 * Math.PI, false);
    context.fillStyle = 'green';
    context.fill();
    context.lineWidth = 5;
    context.strokeStyle = '#003300';
});


