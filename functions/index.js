const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const { setGlobalOptions } = require("firebase-functions/v2");

admin.initializeApp();

// Set global options if needed, e.g., region
setGlobalOptions({ maxInstances: 10 });

/**
 * Triggered when an expense is created or updated in the groups/{groupId}/expenses collection.
 */
exports.onExpenseWrite = onDocumentWritten("groups/{groupId}/expenses/{expenseId}", async (event) => {
    const expenseId = event.params.expenseId;
    const groupId = event.params.groupId;

    // If the document is deleted, we might not want to send a notification (or maybe we do?)
    // User request only mentioned "Add" and "Edit".
    if (!event.data.after.exists) {
        return; // Document deleted
    }

    const newData = event.data.after.data();
    const oldData = event.data.before.exists ? event.data.before.data() : null;
    const isNew = !oldData;

    // We need the payer's name (assuming payer is the actor)
    // User structure: users/{uid} -> displayName
    const payerUid = newData.payerUid;
    const amount = newData.amount;

    if (!payerUid) return;

    try {
        // 1. Get Payer Name
        const payerSnap = await admin.firestore().collection("users").doc(payerUid).get();
        const payerName = payerSnap.exists ? (payerSnap.data().displayName || "Someone") : "Someone";

        // 2. Get Group Members to notify
        const groupSnap = await admin.firestore().collection("groups").doc(groupId).get();
        if (!groupSnap.exists) return;

        const groupData = groupSnap.data();
        const memberUids = groupData.members || [];

        // 3. Collect tokens
        const tokens = [];
        for (const uid of memberUids) {
            // Optional: Exclude the payer from receiving the notification? 
            // Often the user who made the change doesn't need a push.
            if (uid === payerUid && isNew) continue;

            const userSnap = await admin.firestore().collection("users").doc(uid).get();
            if (userSnap.exists) {
                const userData = userSnap.data();
                if (userData.fcmTokens && Array.isArray(userData.fcmTokens)) {
                    tokens.push(...userData.fcmTokens);
                }
            }
        }

        if (tokens.length === 0) {
            console.log("No tokens found for group members.");
            return;
        }

        // 4. Construct Message
        const title = isNew ? "新帳目" : "帳目修改";
        const description = newData.description || "未命名";
        const body = isNew
            ? `${payerName} 新增項目 ${description} : ${amount}元`
            : `${payerName} 修改項目 ${description} : ${amount}元`;

        // 5. Send Multicast
        const message = {
            notification: {
                title: title,
                body: body,
            },
            tokens: tokens, // List of tokens
            webpush: {
                fcmOptions: {
                    link: `/group/${groupId}` // Deep link to the group
                }
            }
        };

        const batchResponse = await admin.messaging().sendEachForMulticast(message);
        console.log("Messages sent:", batchResponse.successCount, "failed:", batchResponse.failureCount);

        // Cleanup invalid tokens if any failed
        if (batchResponse.failureCount > 0) {
            // Basic cleanup logic could be implemented here
            // For PWA, tokens can become stale.
        }

    } catch (error) {
        console.error("Error sending notification:", error);
    }
});
