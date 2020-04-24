const socket = io()

const createAccButton = document.querySelector('#create-account')
const logInButton = document.querySelector('#log-in')
const signInError = document.querySelector('#error')


//template
const $roomTemplate = document.querySelector('#room-template')

const { email, password } = Qs.parse(location.search, { ignoreQueryPrefix: true })


//sign up process
if (createAccButton !== null) {
    createAccButton.addEventListener('click', function(e) {
        const username = document.querySelector('#CAusername').value
        const email = document.querySelector('#CAemail').value
        const password = document.querySelector('#CApassword').value

        socket.emit('signup', { username, email, password }, (error) => {
            if (error) {
                console.log(error)
            }
        })
    })
}

function validateUserName() {
    const username = document.querySelector('#CAusername').value
    socket.emit('user', { username }, (error) => {
        if (error) {
            document.querySelector('#errorUserName').style.display = 'block'
            createAccButton.disabled = true
        } else {
            document.querySelector('#errorUserName').style.display = 'none'
            createAccButton.disabled = false
        }
    })

}

function validateEmail() {
    const email = document.querySelector('#CAemail').value

    socket.emit('email', { email }, (error) => {
        if (error) {
            document.querySelector('#errorEmail').style.display = 'block'
            createAccButton.disabled = true
        } else {
            document.querySelector('#errorEmail').style.display = 'none'
            createAccButton.disabled = false
        }
    })

}

function validatePassword() {
    const password = document.querySelector('#CApassword').value
    if (password.length <= 7 || password === 'password') {
        document.querySelector('#errorPassword').style.display = 'block'
        createAccButton.disabled = true
    } else {
        document.querySelector('#errorPassword').style.display = 'none'
        createAccButton.disabled = false
    }


}



//signin process
if (logInButton !== null) {
    logInButton.addEventListener('click', (e) => {

        const email = document.querySelector('#LIemail').value
        const password = document.querySelector('#LIpassword').value
        socket.emit('signin', { email, password }, (error) => {
            if (error) {
                location = '/invalidLogin.html'
            }
        })
    })
}


function openLoginInfo() {
    document.querySelector('.b-form').style.opacity = 0.01
    document.querySelector('.box-form').style.left = -37 + '%'
    document.querySelector('.box-info').style.right = -37 + '%'
}

function closeLoginInfo() {
    document.querySelector('.b-form').style.opacity = 1
    document.querySelector('.box-form').style.left = 0 + 'px'
    document.querySelector('.box-info').style.right = -5 + 'px'
}