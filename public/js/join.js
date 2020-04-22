const socket = io()

const sel = document.querySelector('#available-rooms');
const roomInput = document.querySelector('#existing-room')
const createButton = document.querySelector('#create-button')
const joinButton = document.querySelector("#join-button")
const createRoomButton = document.querySelector('#create-room-button')



//template
const $roomTemplate = document.querySelector('#room-template')

const { email, password } = Qs.parse(location.search, { ignoreQueryPrefix: true })


//getting available rooms from server and rendering into html
socket.on('availableRooms', (rooms) => {

    if (rooms.length === 0) {
        var opt = document.createElement('option');
        opt.appendChild(document.createTextNode('No rooms available'));
        opt.disabled = true
        opt.selected = true
        opt.value = 'no rooms'
        sel.appendChild(opt);
        joinButton.disabled = true
    } else {
        var opt = document.createElement('option');
        opt.appendChild(document.createTextNode('Select room to join'));
        opt.disabled = true
        opt.selected = true
        opt.value = ''
        sel.appendChild(opt);
        joinButton.disabled = true
    }


    const html = rooms.forEach((room) => {
        var opt = document.createElement('option');
        opt.appendChild(document.createTextNode(room.room.name));
        opt.value = room.room.name;
        // select the first item
        // if (opt.value = rooms[0].room.name) {
        //     opt.selected = true
        // }
        sel.appendChild(opt);
        sel.onchange = () => {
            joinButton.disabled = false
        }
    })

    $roomTemplate.insertAdjacentHTML('beforebegin', html)

})

joinButton.addEventListener('click', () => {
    if (roomInput.value.length === 0) {
        roomInput.disabled = true
    }
})


document.querySelector('#email').value = email
document.querySelector('#password').value = password


socket.emit('getRooms', { email }, (error) => {
    if (error) {
        location.href = '/404.html'
    }
})