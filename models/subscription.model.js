import mongoose from "mongoose";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const NEPAL_TIMEZONE = "Asia/Kathmandu";

const subscriptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Subscription name is required"],
      trim: true,
      minlength: [2, "Subscription name must be at least 2 characters long"],
      maxlength: [100, "Subscription name must be at most 100 characters long"],
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be a positive number"],
    },

    currency: {
      type: String,
      default: "USD",
      enum: ["USD", "EUR", "GBP", "JPY", "CAD", "AUD"],
    },

    frequency: {
      type: String,
      required: [true, "Frequency is required"],
      enum: ["daily", "weekly", "monthly", "yearly"],
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "entertainment",
        "utilities",
        "software",
        "health",
        "education",
        "other",
      ],
    },

    paymentMethod: {
      type: String,
      required: [true, "Payment method is required"],
      trim: true,
    },

    status: {
      type: String,
      required: [true, "Status is required"],
      enum: ["active", "cancelled", "expired"],
      default: "active",
    },

    startDate: {
      type: Date,
      required: [true, "Start date is required"],

      validate: {
        validator: function (value) {
          return value <= new Date();
        },
        message: "Start date cannot be in the future",
      },
    },

    renewalDate: {
      type: Date,
      required: [true, "Renewal date is required"],

      validate: {
        validator: function (value) {
          return value > this.startDate;
        },
        message: "Renewal date must be after the start date",
      },
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/*
|--------------------------------------------------------------------------
| Calculate renewal date using Nepal timezone
|--------------------------------------------------------------------------
*/

subscriptionSchema.pre("validate", function () {
  if (!this.renewalDate && this.startDate && this.frequency) {
    // Convert stored UTC instant into Nepal time
    const start = dayjs(this.startDate).tz(NEPAL_TIMEZONE);

    let renewal;

    switch (this.frequency) {
      case "daily":
        renewal = start.add(1, "day");
        break;

      case "weekly":
        renewal = start.add(1, "week");
        break;

      case "monthly":
        renewal = start.add(1, "month");
        break;

      case "yearly":
        renewal = start.add(1, "year");
        break;

      default:
        throw new Error(`Unsupported frequency: ${this.frequency}`);
    }

    // Convert back to JavaScript Date.
    // MongoDB stores Date as an absolute UTC timestamp.
    this.renewalDate = renewal.toDate();

    // If renewal already passed, mark subscription expired
    if (this.renewalDate <= new Date()) {
      this.status = "expired";
    }
  }
});

const Subscription = mongoose.model(
  "Subscription",
  subscriptionSchema
);

export default Subscription;