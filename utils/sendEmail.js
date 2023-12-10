const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIN_MAIL,
        pass: process.env.MAIN_PASS
    }
})

module.exports = async (email, subject, html) => {
    var options = {
        from: process.env.MAIN_MAIL,
        to: email,
        subject,
        html
    };

    transporter.sendMail(options, (err, info) => {
        if (err) {
            console.log(err);
            return false;
        }
        else
            return true;
    })

}