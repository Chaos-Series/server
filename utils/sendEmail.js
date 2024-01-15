const nodemailer = require("nodemailer");

function sendEmail(nombre, correo, asunto, mensaje) {
    return new Promise((resolve, reject) => {
        var transporter = nodemailer.createTransport({
            host: "cp.alienhost.ovh",
            port: "465",
            secure: true,
            auth: {
                user: "contacto@chaosseries.com",
                pass: "nDpPq7aDH#8vKBEB",
            },
        });

        const mail_configs = {
            from: "contacto@chaosseries.com",
            to: "contacto@chaosseries.com",
            subject: "Nuevo Contacto de " + nombre,
            html: `<!DOCTYPE html>
  <html lang="en" >
  <head>
    <meta charset="UTF-8">
    <title>Chaos Series Contacto</title>
  </head>
  <body>
  <!-- partial:index.partial.html -->
  <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
    <div style="margin:50px auto;width:70%;padding:20px 0">
      <div style="border-bottom:1px solid #eee">
        <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">${asunto}</a>
      </div>
      <p>${mensaje}</p>
      <p style="font-size:0.9em;">De:<br />${correo}, ${nombre}</p>
      <hr style="border:none;border-top:1px solid #eee" />
    </div>
  </div>
  <!-- partial -->
    
  </body>
  </html>`,
        };
        transporter.sendMail(mail_configs, function (error, info) {
            if (error) {
                console.log(error);
                return reject({ message: `An error has occured` });
            }
            return resolve({ message: "Email sent succesfuly" });
        });
    });
}

module.exports = sendEmail;