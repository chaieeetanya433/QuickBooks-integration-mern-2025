const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { handleAccountWebhookEvent } = require('../controllers/webhookController');

const QBO_WEBHOOK_VERIFIER_KEY = process.env.QBO_WEBHOOK_VERIFIER_KEY;

// Middleware to verify webhook signature
function verifySignature(req, res, next) {
    const signature = req.headers['intuit-signature'];
    const hmac = crypto.createHmac('sha256', QBO_WEBHOOK_VERIFIER_KEY);
    const hash = hmac.update(JSON.stringify(req.body)).digest('base64');

    console.log(hash, 'HASH');
    console.log(signature, 'SIGNATURE');

    if (signature === hash) {
        next();
    } else {
        res.status(401).send('Unauthorized - Signature mismatch');
    }
}

router.post("/webhook", verifySignature, async (req, res) => {
    try {
        const events = req.body?.eventNotifications?.[0]?.dataChangeEvent?.entities || [];

        for (const event of events) {
            if (event.name === "Account") {
                console.log(`📥 Webhook: ${event.operation} on Account ID ${event.id}`);
                await handleAccountWebhookEvent(event); // delegate to controller
            }
        }

        res.sendStatus(200);
    } catch (err) {
        console.error("Webhook error:", err);
        res.sendStatus(500);
    }
});

module.exports = router;
