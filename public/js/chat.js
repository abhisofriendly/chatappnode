const socket = io('http://localhost:3000');

// elements
const $messageForm = document.querySelector('#msgform');
const $messageFormInput = document.querySelector('input');
const $messageFormButton = document.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

// templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;

socket.on('message', (msg) => {
    console.log(msg)
    const html = Mustache.render(messageTemplate, {
        message: msg
    })
    $messages.insertAdjacentHTML('beforeend', html);
})

// options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

socket.on('locationmessage', (url) => {
    console.log(url)
    const html = Mustache.render(locationTemplate, {
        location: url
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('roomData',({ room, users })=>{
    console.log(room);
    console.log(users);
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    $messageFormButton.setAttribute('disabled', 'disabled')
    const message = $messageFormInput.value;
    socket.emit('sendmessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();
        if (error) {
            console.log(error)
        }
        console.log('message delivered')
    });
})

$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('geolocation is not supported by your browser')
    }
    $sendLocationButton.setAttribute('disabled', 'disabled');
    navigator.geolocation.getCurrentPosition((position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        socket.emit('location', latitude, longitude, () => {
            $sendLocationButton.removeAttribute('disabled');
            console.log('location shared')
        })
    })
})

socket.emit('join', { username, room },(error)=>{
    if(error){
        alert(error);
        location.href = '/'
    }
});