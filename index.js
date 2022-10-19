import Twilio from 'twilio';
import dotenv from 'dotenv';

const { parsed: env } = dotenv.config({ path: '../.env.functions' });

const sms_using_twilio = async (req, res) => {
    
        const { method, body: { to = null, message = '' } = {} } = req;

        // health check
        if (req.params.health === 'health') {
            res.write(JSON.stringify({ success: true, msg: 'Health check success' }));
            res.end();
        }

        if (method !== 'POST') {
            res.status(405).send({ success: false, msg: 'Only POST method is allowed' });
        }

        if (!env.TWILIO_AUTH_TOKEN || !env.TWILIO_SID) {
            res.status(400).send({ success: false, msg: 'Twilo credentials are missing' });
        }

        if (!to) {
            res.status(400).send({ success: false, msg: 'to value is missing in body' });
        }

        const twilio = Twilio(env.TWILIO_SID, env.TWILIO_AUTH_TOKEN);

        try {
            const messageResponse = await twilio.messages.create({
                from: env.TWILIO_PHONE_NUMBER,
                to,
                body: message,
            });
            res.status(200).send({ success: false, msg: 'message send successfully', data: messageResponse });
        } catch (error) {
            res.status(500).send({ success: false, msg: error });
        }
    
};

export default sms_using_twilio;
