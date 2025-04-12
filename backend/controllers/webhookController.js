const { getAccountDetailsFromQBO } = require("../services/qboService");
const ChartOfAccount = require("../models/ChartOfAccount"); // assuming Mongoose

exports.handleAccountWebhookEvent = async (event) => {
    const { id, operation } = event;

    // Fetch latest data from QBO
    const accountData = await getAccountDetailsFromQBO(id);

    if (!accountData) {
        console.warn(`No data returned from QBO for Account ID ${id}`);
        return;
    }

    if (operation === "Create" || operation === "Update") {
        await ChartOfAccount.findOneAndUpdate({ Id: id }, accountData, { upsert: true });
        console.log(`✅ Account ${operation}d and synced: ID ${id}`);
    }

    if (operation === "Delete") {
        await ChartOfAccount.findOneAndUpdate({ Id: id }, { Active: false }); // or delete
        console.log(`❌ Account marked as inactive: ID ${id}`);
    }
};
