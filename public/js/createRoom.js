const socket = io()

const roomInput = document.querySelector('#new-room')
const createButton = document.querySelector('#create-button')
const cancelButton = document.querySelector('#cancel-button')


//template
const { email, password } = Qs.parse(location.search, { ignoreQueryPrefix: true })


document.querySelector('#email').value = email
document.querySelector('#password').value = password


cancelButton.addEventListener('click', () => {
    history.back()
})



//creating room process
createButton.addEventListener('click', (e) => {

    const roomName = roomInput.value
    socket.emit('createRoom', { email, roomName }, (error) => {
        if (error) {
            location = '/404.html'
        }
    })
})

function validateRoom() {
    const roomName = roomInput.value
    socket.emit('validateRoom', { roomName }, (error) => {
        if (error) {
            document.querySelector('#error').style.display = 'block'
            createButton.disabled = true
        } else {
            document.querySelector('#error').style.display = 'none'
            createButton.disabled = false
        }
    })
}