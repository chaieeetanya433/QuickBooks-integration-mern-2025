const crypto = require("crypto");

function verifyWebhookSignature(req, res, next) {
    const signature = req.headers['intuit-signature'];
    if (!signature) {
        return res.status(401).send('Signature missing');
    }
    
    // Convert the raw request body to a string if it's a Buffer
    const payload = req.body instanceof Buffer ? req.body.toString() : JSON.stringify(req.body);
    
    // Compute the HMAC signature using your app's Client Secret
    const hmac = crypto.createHmac('sha256', process.env.CLIENT_SECRET);
    hmac.update(payload);
    const computedSignature = hmac.digest('base64');
    
    // Compare signatures
    if (signature !== computedSignature) {
        console.error('Webhook signature verification failed');
        return res.status(401).send('Signature verification failed');
    }
    
    next();
}

module.exports = {
    verifyWebhookSignature
}