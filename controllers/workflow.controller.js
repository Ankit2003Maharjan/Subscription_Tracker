import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { serve } = require("@upstash/workflow/express");

import Subscription from "../models/subscription.model.js";
import { sendReminderEmail } from "../utils/send-email.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const NEPAL_TIMEZONE = "Asia/Kathmandu";


// ========================================
// PRODUCTION SUBSCRIPTION REMINDER WORKFLOW
// ========================================

export const sendReminders = serve(async (context) => {
  const { subscriptionId } = context.requestPayload;

  console.log("🔥 SUBSCRIPTION REMINDER WORKFLOW STARTED");
  console.log("Subscription ID:", subscriptionId);

  // ========================================
  // GET SUBSCRIPTION
  // ========================================

  const subscription = await fetchSubscription(
    context,
    subscriptionId
  );

  if (!subscription) {
    console.log("❌ Subscription not found");
    return;
  }

  // ========================================
  // CHECK SUBSCRIPTION STATUS
  // ========================================

  if (subscription.status !== "active") {
    console.log(
      `❌ Subscription is not active. Status: ${subscription.status}`
    );

    return;
  }

  console.log("📦 Subscription:", subscription.name);
  console.log("👤 User:", subscription.user.name);
  console.log("📧 Email:", subscription.user.email);

  // ========================================
  // RENEWAL DATE
  // ========================================

  const renewalDate = dayjs(subscription.renewalDate).tz(
    NEPAL_TIMEZONE
  );

  console.log(
    "📅 Renewal Nepal time:",
    renewalDate.format("YYYY-MM-DD HH:mm:ss")
  );

  // ========================================
  // 7 DAYS BEFORE
  // ========================================

  await handleReminder(
    context,
    subscription,
    renewalDate,
    7,
    "7 days before reminder",
    "Reminder 7 days before"
  );

  // ========================================
  // 5 DAYS BEFORE
  // ========================================

  await handleReminder(
    context,
    subscription,
    renewalDate,
    5,
    "5 days before reminder",
    "Reminder 5 days before"
  );

  // ========================================
  // 2 DAYS BEFORE
  // ========================================

  await handleReminder(
    context,
    subscription,
    renewalDate,
    2,
    "2 days before reminder",
    "Reminder 2 days before"
  );

  // ========================================
  // 1 DAY BEFORE
  // ========================================

  await handleReminder(
    context,
    subscription,
    renewalDate,
    1,
    "1 day before reminder",
    "Reminder 1 day before"
  );

  console.log("🎉 SUBSCRIPTION REMINDER WORKFLOW COMPLETED");
});


// ========================================
// HANDLE INDIVIDUAL REMINDER
// ========================================

const handleReminder = async (
  context,
  subscription,
  renewalDate,
  daysBefore,
  emailType,
  stepName
) => {
  // Calculate reminder date in Nepal time
  const reminderDate = renewalDate.subtract(
    daysBefore,
    "day"
  );

  // Get current Nepal time
  const currentNepalTime = dayjs().tz(
    NEPAL_TIMEZONE
  );

  console.log("----------------------------------------");

  console.log(
    `⏰ ${daysBefore}-day reminder:`,
    reminderDate.format("YYYY-MM-DD HH:mm:ss")
  );

  console.log(
    "🇳🇵 Current Nepal time:",
    currentNepalTime.format("YYYY-MM-DD HH:mm:ss")
  );

  // ========================================
  // CHECK IF REMINDER HAS ALREADY PASSED
  // ========================================

  if (reminderDate.isBefore(currentNepalTime)) {
    console.log(
      `⏭️ Skipping ${daysBefore}-day reminder because it has already passed`
    );

    return;
  }

  // ========================================
  // WAIT UNTIL REMINDER DATE
  // ========================================

  console.log(
    `😴 Sleeping until ${reminderDate.format(
      "YYYY-MM-DD HH:mm:ss"
    )}`
  );

  await context.sleepUntil(
    stepName,
    reminderDate.toDate()
  );

  // ========================================
  // SEND EMAIL
  // ========================================

  await context.run(
    `Send ${stepName} email`,
    async () => {
      console.log(
        `📧 Sending ${daysBefore}-day reminder email...`
      );

      await sendReminderEmail({
        to: subscription.user.email,
        type: emailType,
        subscription,
      });

      console.log(
        `✅ ${daysBefore}-day reminder email sent successfully`
      );
    }
  );
};


// ========================================
// FETCH SUBSCRIPTION
// ========================================

const fetchSubscription = async (
  context,
  subscriptionId
) => {
  return await context.run(
    "get subscription",
    async () => {
      return Subscription.findById(
        subscriptionId
      ).populate(
        "user",
        "name email"
      );
    }
  );
};