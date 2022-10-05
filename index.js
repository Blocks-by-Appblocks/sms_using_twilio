import Twilio from 'twilio';
import dotenv from 'dotenv';

const { parsed: env } = dotenv.config({ path: '../.env.functions' });

const sms_using_twilio = async (req, res) => {
    try {
        const { method } = req;
        let _message = '';
        let _to = null;

        // health check
        if (req.params.health === 'health') {
            res.write(JSON.stringify({ success: true, msg: 'Health check success' }));
            res.end();
        }

        // for GET Method grab the payload from req.query
        if (method === 'GET') {
            const {
                query: { to = null, message = '' },
            } = req;
            _message = message;
            _to = to;
            // twilio requires phone number with '+' code in the beginning
            // '+' sign cant be passed through query string as  it is used to represent a space
            // so manually add a '+' sign if it is not present in the number
            if (to && to[0] !== '+') {
                _to = `+${to.trim()}`;
            }
        }

        // for POST Method grab the payload from req.body
        if (method === 'POST') {
            const { body: { to = null, message = '' } = {} } = req;
            _to = to;
            _message = message;
        }

        if(!env.TWILIO_AUTH_TOKEN || !env.TWILIO_SID ){
          res.write(JSON.stringify({ success: false, msg: `TWILIO Credentials are missing ` }));
          res.end();
          return;
        }

        if (!_to) {
            res.write(JSON.stringify({ success: false, msg: `to value is missing` }));
            res.end();
            return;
        }
      
        const twilio = Twilio(env.TWILIO_SID, env.TWILIO_AUTH_TOKEN);
        try {
            const messageResponse = await twilio.messages.create({
                from: env.TWILIO_PHONE_NUMBER,
                to: _to,
                body: _message,
            });
            res.write(JSON.stringify({ success: true, msg: `message send successfully`, data: messageResponse }));
            res.end();
        } catch (error) {
            res.write(JSON.stringify({ success: false, msg: `something went wrong`, data: error }));
            res.end();
        }
    } catch (error) {
        res.write(JSON.stringify({ success: false, msg: `Internal Error`,data:error }));
        res.end();
    }
};

export default sms_using_twilio;
