const sgMail = require('@sendgrid/mail')
const axios = require("axios");

sgMail.setApiKey(process.env.SENDGRID_API_KEY)


const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'shah98@sheridancollege.ca',
        subject: 'Welcome to the App',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`
    })
}
const sendCancellationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'shah98@sheridancollege.ca',
        subject: 'Sorry to see you go! ',
        text: `Goodbye,${name}. Hope to see you back soon.Is there anything we could have done to keep you on board.`
    })
}

const sendInvitationEmail = (email, name, room) => {
    var request = require("request");

    var options = {
        method: 'POST',
        url: 'https://api.sendgrid.com/v3/mail/send',
        headers: {
            'content-type': 'application/json',
            authorization: 'Bearer ' + process.env.SENDGRID_API_KEY
        },
        body: {
            personalizations: [{
                to: [{ email: email }],
                dynamic_template_data: { email: email, room: room, name: name },
                subject: 'Hello, World!'
            }],
            from: { email: 'shah98@sheridancollege.ca', name: 'DashChat' },
            reply_to: { email: 'shah98@sheridancollege.ca', name: 'DashChat' },
            template_id: process.env.TEMPLATE_ID
        },
        json: true
    };

    try {
        request(options, function(error, response, body) {
            if (error) throw new Error(error);
        })

    } catch (e) {
        console.log(e)
    }


}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail,
    sendInvitationEmail
}