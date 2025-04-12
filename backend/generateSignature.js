const crypto = require("crypto");

const body = JSON.stringify({
  eventNotifications: [
    {
      realmId: "123456789",
      dataChangeEvent: {
        entities: [
          {
            name: "Account",
            id: "123",
            operation: "Update"
          }
        ]
      }
    }
  ]
});

const secret = process.env.QBO_WEBHOOK_VERIFIER_KEY; 
const hmac = crypto.createHmac("sha256", secret);
const signature = hmac.update(body).digest("base64");

console.log("Signature:", signature);
