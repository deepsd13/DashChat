const socket = io()
    //Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = document.querySelector('#message')
const $messageFormButton = $messageForm.querySelector('#sendBtn')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const $about_desc = document.querySelector('#about_desc')



//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
const $senderMessageTemplate = document.querySelector('#sender-message-template')


//options
const { email, roomName, password } = Qs.parse(location.search, { ignoreQueryPrefix: true })
const autoScroll = () => {
    //new message element
    const $newMessage = $messages.lastElementChild

    //Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //height of messages container
    const containerHeight = $messages.scrollHeight

    //how far the screen is scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (Math.round(containerHeight - newMessageHeight - 1) <= Math.round(scrollOffset)) {
        $messages.scrollTop = $messages.scrollHeight
    }
}




socket.emit('join', { email, roomName }, (error) => {
    if (error) {
        location.href = '/404.html'
    }
})

socket.on('authenticationError', (message) => {
    Alert.render(message)
})

socket.on('welcomeMessage', (message) => {
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        text: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })

    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('message', ({ msg, user }) => {

    function getRandomColor() {
        var letters = ['#3366ff', '#66ccff', '#ff33cc', '#00cc00', '#ffff00', '#339966', '#ff3300', '#cc0066', '#669999', '#ccffff', '#9966330', '#99ff33'];
        var color = letters[Math.floor(Math.random() * 11)];
        return color;
    }

    const color = getRandomColor()
    const message = {
        username: msg.username,
        text: msg.text,
        createdAt: msg.createdAt,
        color: color
    }
    const html = Mustache.render(messageTemplate, message)
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()

})

socket.on('locationMessage', (message) => {
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('roomData', async({ room, user }) => {

    //populating the room with its users
    const users = []

    room.users.forEach((user) => {
        users.push(user.user)
    })
    const htmlSideBar = Mustache.render(sidebarTemplate, {
        room: room.name,
        users
    })

    document.querySelector('#sidebar').innerHTML = htmlSideBar

    // populating room with its messages saved before

    if (user.email === email) {
        room.messages.forEach((messageData) => {

            function getRandomColor() {
                var letters = '0123456789ABCDEF';
                var color = '#';
                for (var i = 0; i < 6; i++) {
                    color += letters[Math.floor(Math.random() * 16)];
                }
                return color;
            }

            const color = getRandomColor()
            const message = {
                username: messageData.message.username,
                text: messageData.message.text,
                createdAt: messageData.message.createdAt,
                color: color
            }
            const htmlMessages = Mustache.render(messageTemplate,
                message
            )
            $messages.insertAdjacentHTML('beforeend', htmlMessages)

        })
        autoScroll()
    }

})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value
    socket.emit('sendMessage', { message, email, roomName }, (error) => {
        if (error) {
            Alert.render(error)
        }
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        console.log('Delivered')
    })
})


$messageFormButton.addEventListener('click', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = $messageFormInput.value
    socket.emit('sendMessage', { message, email, roomName }, (error) => {
        if (error) {
            Alert.render(error)
        }
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        console.log('Delivered')
    })
})

$sendLocationButton.addEventListener('click', () => {

    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser!')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')



    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            email,
            roomName
        }, () => {
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location Shared!')
        })
    }, undefined, { enableHighAccuracy: true })
})

function emitAuthenticateError() {
    socket.on('authenticationError', (message) => {
        Alert.render(message)
    })
}

function leaveRoom() {
    emitAuthenticateError()
    const cnfrm = Confirm.render('Do you really want to leave this room? You will no longer' +
        ' be a part of this group but, ofcourse you can join in again :)', 'leaveRoom', email, password)
}




function logOut() {
    emitAuthenticateError()
    socket.emit('logout', { email }, (error) => {
        if (error) {
            alert(error)
        }
    })
}

function deleteAccount() {
    emitAuthenticateError()
    Confirm.render('Do you really want to delete the account? You will lose all the saved messages.' +
        'But ofcourse you can create a new account whenever you like :)', 'deleteAccount', email, password)
}

function openNav() {
    document.getElementById("myNav").style.width = "100%";
}

function closeNav() {
    document.getElementById("myNav").style.width = "0%";
}

function expandInvDiv() {
    document.querySelector('#invitation').style.display = 'block'
}

function hideInvDiv() {
    document.querySelector('#invitation').style.display = 'none'
    document.querySelector('#result').style.display = 'none'
}

function sendInvitation() {
    socket.emit('sendInvitationEmail', { email: document.querySelector('#invEmail').value, roomName }, (error) => {
        if (error) {
            document.querySelector('#result').style.display = 'block'
            document.querySelector('#result').style.color = 'red'
            document.querySelector('#result').innerHTML = 'Enter a valid Email! Email you enter must be a current user of the application! ;)'
        } else {
            document.querySelector('#result').style.display = 'block'
            document.querySelector('#result').style.color = 'green'
            document.querySelector('#result').innerHTML = 'Email sent! ;)'
        }
    })
}

document.querySelector('#about').addEventListener('click', () => {
    if ($about_desc.style.display === 'block') {
        $about_desc.style.display = 'none'
    } else {
        $about_desc.style.display = 'block'
    }
})


function openUsersList() {
    const userslist = document.querySelector('.users_list')
    if (userslist.style.maxHeight) {
        userslist.style.maxHeight = null;
    } else {
        userslist.style.maxHeight = userslist.scrollHeight + "px";
    }
}