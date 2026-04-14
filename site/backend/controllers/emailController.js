const asyncHandler = require('express-async-handler');

const nodemailer = require('nodemailer');

const parseBoolean = (value, fallback = false) => {
    if (value === undefined) {
        return fallback;
    }

    return String(value).toLowerCase() === 'true';
};

const SMTP_HOST = process.env.SMTP_HOST || 'localhost';
const SMTP_PORT = Number(process.env.SMTP_PORT || 25);
const SMTP_SECURE = parseBoolean(process.env.SMTP_SECURE, false);
const SMTP_REJECT_UNAUTHORIZED = parseBoolean(process.env.SMTP_REJECT_UNAUTHORIZED, false);
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';

const MAIL_FROM = process.env.MAIL_FROM || 'info@talesofreval.ee';
const MAIL_TO = process.env.MAIL_TO || 'info@talesofreval.ee';
const MAIL_SIGNATURE_NAME = process.env.MAIL_SIGNATURE_NAME || 'Tales of Reval';
const MAIL_SIGNATURE_PHONE = process.env.MAIL_SIGNATURE_PHONE || '+372 5560 4421';
const MAIL_WEBSITE = process.env.MAIL_WEBSITE || 'https://www.talesofreval.ee';

const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: SMTP_USER && SMTP_PASS ? {
        user: SMTP_USER,
        pass: SMTP_PASS,
    } : undefined,
    tls: {
        rejectUnauthorized: SMTP_REJECT_UNAUTHORIZED,
    },
});

const sendNodeEmail = async (msg) => {
  try {
    const info = await transporter.sendMail(msg);
    console.log("Email sent successfully", info);
    return 1;
  } catch (error) {
    console.error("Error sending email:", error);
    return 0;
  }
};

const signatureHtml = () => `
    ${MAIL_SIGNATURE_NAME}<br />
    <a href="${MAIL_WEBSITE}">${MAIL_WEBSITE}</a><br />
    <a href="mailto:${MAIL_TO}">${MAIL_TO}</a><br />
    ${MAIL_SIGNATURE_PHONE}
`;

const formatBookingDate = (dateString, time = '') => {
  const parsed = new Date(dateString);
  const dateLabel = Number.isNaN(parsed.getTime()) ? dateString : parsed.toDateString();
  return time ? `${dateLabel} at ${time}` : dateLabel;
};

const FREE_TOUR_CONFIRMATION_TEMPLATE = ({ date, time, people, name }) => `
  <div style="width: 500px; min-height: 220px; font-family: Arial, sans-serif; color:black !important;">
    <p>Greetings!</p>
    <p>
      This is a confirmation that we have received your free tour registration.
      <br />
      Tour date: ${formatBookingDate(date, time)}
      <br />
      Number of people: ${people}
      <br />
      Name: ${name}
    </p>
    <p>
      If anything changes, please contact us at
      <a href="mailto:${MAIL_TO}">${MAIL_TO}</a>.
    </p>
    <p>With warm regards</p>
    <p>
      ${signatureHtml()}
    </p>
  </div>
`;


const sendBookingTor = async (mailData) => {
    const msg = {
        to: MAIL_TO,
        from: MAIL_FROM,
        subject: "Tor Booking",
        text: `Name: ${mailData.name}\nEmail: ${mailData.email}\nMessage: ${mailData.message}`,
        html: `
        <div style="width: 500px; min-height: 300px; font-family: Arial, sans-serif; color:black !important;">
                <div>
                    <p>
                        New Booking inquiry.
                        <br /><br />
                        Event Type: ${mailData.eventType}
                        <br />
                        Client Name: ${mailData.name} 
                        <br />
                        Client email: ${mailData.email})</p>
                        <br />
                        Message: ${mailData.message}
                    </p>
                </div>
            </div>`,
        replyTo: mailData.email
    };
    
    const info = await sendNodeEmail(msg);
    return info;
};

const sendBookingClient = async (mailData) => {
    const msg = {
        to: mailData.email,
        from: MAIL_FROM,
        subject: "Copy of Booking Email",
        text: `Name: ${mailData.name}\nEmail: ${mailData.email}\nMessage: ${mailData.message}`,
        html: `
            <div style="width: 500px; min-height: 300px; font-family: Arial, sans-serif; color:black !important;">
                <div>
                    <p>Greetings!</p>
                    <p>
                        This is a confirmation that we have received your booking request. 
                        <br />
                        We will get back to you as soon as possible to confirm the details of your booking.
                        <br /><br />
                        Service type: ${mailData.eventType}
                    </p>
                    <p>With warm regards</p>
                    <p>${signatureHtml()}</p>
                </div>
            </div>
        `
    };

    const info = await sendNodeEmail(msg);
    return info;
};


//@desc Send booking email
//@route POST /email
//@access Public
const sendBookingEmail = asyncHandler(async (req, res) => {
    const info = await sendBookingTor(req.body);
    const clientInfo = await sendBookingClient(req.body);

    if(info === 1 && clientInfo === 1){
        res.status(200).json(info);
    } else {   
        res.status(400).json(info < clientInfo ? info : clientInfo);
    }
});

const sendContactTor = async (mailData) => {
    const msg = {
        to: MAIL_TO,
        from: MAIL_FROM,
        subject: "Contact Us",
        text: `Name: ${mailData.name}\nEmail: ${mailData.email}\nMessage: ${mailData.message}`,
        html: `<p style="font-weight:bold;">Name: ${mailData.name}</p><p style="font-weight:bold;">Email: ${mailData.email}</p><p style="font-size:18px;">Message: ${mailData.message}</p>`,
        replyTo: mailData.email
    };
    
    const info = await sendNodeEmail(msg);
    return info;
};

const sendContactClient = async (mailData) => {
    const msg = {
        to: mailData.email,
        from: MAIL_FROM,
        subject: "Copy of Contact Us Email",
        text: `Name: ${mailData.name}\nEmail: ${mailData.email}\nMessage: ${mailData.message}`,
        html: `<p style="font-size: 8px;">This message includes a copy of the email sent to ${MAIL_TO} regarding your most recent contact us message.</p><p style="font-weight:bold;">Name: ${mailData.name}</p><p style="font-weight:bold;">Email: ${mailData.email}</p><p style="font-size:18px;">Message: ${mailData.message}</p>`
    };
    
    const info = await sendNodeEmail(msg);
    return info;
};

//@desc Send email
//@route POST /email
//@access Public
const sendContactEmail = asyncHandler(async (req, res) => {
    const info = await sendContactTor(req.body);
    const clientInfo = await sendContactClient(req.body);

    if(info === 1 && clientInfo === 1){
        res.status(200).json(info);
    } else {   
        res.status(400).json(info < clientInfo ? info : clientInfo);
    }
});

//@desc Send booking email
//@route POST /email
//@access Public
const sendFreeTourEmail = asyncHandler(async (req, res) => {
    const info = await sendFreeTourTor(req.body);
    const clientInfo = await sendFreeTourClient(req.body);

    if(info === 1 && clientInfo === 1){
        res.status(200).json(info);
    } else {
        res.status(400).json(info < clientInfo ? info : clientInfo);
    }
});

const sendFreeTourTor = async (mailData) => {
    const msg = {
        to: MAIL_TO, 
        from: MAIL_FROM,
        subject: "Free Tour Booking",
        html: `
            <div style="width: 500px; min-height: 100px; font-family: Arial, sans-serif; color:black !important;">
                <div>
                    <p>
                        New Free Tour Booking!
                        <br />
                        Email: ${mailData.email}
                        <br /> 
                        Name: ${mailData.name}
                        <br />
                        ${formatBookingDate(mailData.dateObject?.date || mailData.date, mailData.time)}
                        <br />
                        Number of people: ${mailData.people}
                    </p>
                </div>
            </div>
        `,
        replyTo: mailData.email
    };
    
    const info = await sendNodeEmail(msg);
    return info;
}

const sendFreeTourClient = async (mailData) => {
    const msg = {
        to: mailData.email,
        from: MAIL_FROM,
        subject: "Free Tour Booking Confirmation",
        html: FREE_TOUR_CONFIRMATION_TEMPLATE({
            date: mailData.dateObject?.date || mailData.date,
            time: mailData.time,
            people: mailData.people,
            name: mailData.name,
        })
    };

    const info = await sendNodeEmail(msg);
    return info;
}

module.exports = { sendBookingEmail, sendContactEmail, sendFreeTourEmail };
