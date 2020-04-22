const socket = io()
const {
    email,
    roomName
} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

socket.emit('invitation', {
    email,
    roomName
}, (error) => {
    if (error) {
        location = '/404.html'
    }
})