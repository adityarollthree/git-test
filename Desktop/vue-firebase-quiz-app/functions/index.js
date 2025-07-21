/* eslint-disable object-curly-spacing */
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.executeCode = functions.https.onCall(async (data, context) => {
  return {
    success: true,
    output: "Code executed successfully! (Mock result for now)",
    timestamp: new Date().toISOString(),
  };
});

exports.submitSolution = functions.https.onCall(async (data, context) => {
  try {
    const { code, questionId } = data;

    // Fix the userId line
    const userId =
      context.auth && context.auth.uid ? context.auth.uid : "anonymous";

    await admin.firestore().collection("submissions").add({
      code,
      questionId,
      userId: userId,
      submittedAt: admin.firestore.FieldValue.serverTimestamp(),
      score: 100,
    });

    return {
      success: true,
      message: "Solution submitted successfully!",
      score: 100,
    };
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message);
  }
});
