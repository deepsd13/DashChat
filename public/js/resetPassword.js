const socket = io()
var password = document.getElementById("password")
var confirm_password = document.getElementById("confirm_password");
const btn = document.querySelector('#btn')

function validatePassword() {
    console.log('one')
    const {
        email
    } = Qs.parse(location.search, {
        ignoreQueryPrefix: true
    })

    if (password.value !== confirm_password.value) {
        document.querySelector('#errorCnfPass').style.display = 'block'
    } else {
        document.querySelector('#errorCnfPass').style.display = 'none'

        socket.emit('resetPassword', { email, password: password.value }, (error) => {
            if (error) {
                console.log(error)
            } else {
                console.log('jd')
                document.querySelector('#success').style.display = 'block'
            }
        })


    }
}

if (btn !== null) {

    btn.addEventListener('click', (e) => {
        const email = document.querySelector('#email').value
        console.log(email)
        socket.emit('findEmail', { email }, (error) => {
            if (error) {
                location = '/accountNotFound.html'
            }
        })


    })
}