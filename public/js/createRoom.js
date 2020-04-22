const socket = io()

const createAccButton = document.querySelector('#create-account')
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
            alert(error)
            location.href = `/join.html?email=${email}&password=${password}/`
        }
    })
})