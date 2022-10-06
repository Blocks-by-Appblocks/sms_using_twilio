import Twilio from 'twilio';
import dotenv from 'dotenv';

const { parsed: env } = dotenv.config({ path: '../.env.functions' });

const sms_using_twilio = async (req, res) => {
    try {
        const { method, body: { to = null, message = '' } = {} } = req;

        // health check
        if (req.params.health === 'health') {
            res.write(JSON.stringify({ success: true, msg: 'Health check success' }));
            res.end();
        }

        if (method !== 'POST') {
            res.write(JSON.stringify({ success: false, msg: `Only POST methods are allowed` }));
            res.end();
            return;
        }

        if (!env.TWILIO_AUTH_TOKEN || !env.TWILIO_SID) {
            res.write(JSON.stringify({ success: false, msg: `TWILIO Credentials are missing` }));
            res.end();
            return;
        }

        if (!to) {
            res.write(JSON.stringify({ success: false, msg: `to value is missing in body` }));
            res.end();
            return;
        }

        const twilio = Twilio(env.TWILIO_SID, env.TWILIO_AUTH_TOKEN);

        try {
            const messageResponse = await twilio.messages.create({
                from: env.TWILIO_PHONE_NUMBER,
                to,
                body: message
            });
            res.write(JSON.stringify({ success: true, msg: `message send successfully`, data: messageResponse }));
            res.end();
        } catch (error) {
            res.write(JSON.stringify({ success: false, msg: `something went wrong`, data: error }));
            res.end();
        }
    } catch (error) {
        res.write(JSON.stringify({ success: false, msg: `Internal Error`, data: error }));
        res.end();
    }
};

export default sms_using_twilio;
