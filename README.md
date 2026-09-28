# Subscription Tracker — Backend

A secure and scalable REST API backend for a **Subscription Tracker** application.

This backend allows users to create and manage their subscriptions, securely authenticate using JWT, store subscription data in MongoDB, and automatically receive email reminders before their subscriptions renew.

---

## 🚀 Features

* User registration and login
* Password hashing with **bcryptjs**
* JWT-based authentication
* Protected API routes
* Subscription creation and management
* MongoDB database integration with **Mongoose**
* Automatic subscription renewal date calculation
* Automated subscription reminder emails
* Reminder notifications:

  * 7 days before renewal
  * 5 days before renewal
  * 2 days before renewal
  * 1 day before renewal
* Background workflow scheduling with **Upstash Workflow**
* Email delivery using **Nodemailer + Gmail**
* API security and request protection with **Arcjet**
* Environment variable configuration
* Express middleware and centralized error handling
* Nepal timezone support using `Asia/Kathmandu`

---

## 🛠️ Tech Stack

### Backend

* **Node.js** — JavaScript runtime
* **Express.js** — REST API framework
* **MongoDB** — Database
* **Mongoose** — MongoDB ODM

### Authentication & Security

* **jsonwebtoken** — JWT authentication
* **bcryptjs** — Password hashing
* **Arcjet** — API security and request protection

### Email & Automation

* **Nodemailer** — Sending emails
* **Upstash Workflow** — Scheduling subscription reminder workflows

### Other

* **dotenv** — Environment variables
* **Day.js** — Date and timezone handling
* **CORS** — Cross-origin request handling

---

# 📁 Project Structure

```text
subscription-tracker/
│
├── config/
│   ├── arcjet.js
│   ├── env.js
│   ├── mongodb.js
│   ├── nodemailer.js
│   └── upstash.js
│
├── controllers/
│   ├── auth.controller.js
│   ├── subscription.controller.js
│   └── workflow.controller.js
│
├── middlewares/
│   ├── auth.middleware.js
│   └── error.middleware.js
│
├── models/
│   ├── user.model.js
│   └── subscription.model.js
│
├── routes/
│   ├── auth.routes.js
│   ├── subscription.routes.js
│   └── workflow.routes.js
│
├── utils/
│   ├── email-template.js
│   └── send-email.js
│
├── app.js
├── package.json
├── .env.development.local
├── .gitignore
└── README.md
```

> The exact folder structure may vary depending on the current implementation.

---

# ⚙️ Installation

## 1. Clone the repository

```bash
git clone <your-repository-url>
```

Move into the project:

```bash
cd subscription-tracker
```

---

## 2. Install dependencies

```bash
npm install
```

---

# 🔐 Environment Variables

Create an environment file such as:

```text
.env.development.local
```

Example:

```env
PORT=3000

NODE_ENV=development

DB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

ARCJET_KEY=your_arcjet_key
ARCJET_ENV=development

QSTASH_URL=http://127.0.0.1:8080
QSTASH_TOKEN=your_qstash_token
QSTASH_CURRENT_SIGNING_KEY=your_current_signing_key
QSTASH_NEXT_SIGNING_KEY=your_next_signing_key

EMAIL_PASSWORD=your_gmail_app_password

SERVER_URL=http://localhost:3000
```

### ⚠️ Important

Never commit your environment file to GitHub.

Add this to `.gitignore`:

```gitignore
node_modules/
.env
.env.*
!.env.example
```

If you create an example environment file, keep only placeholder values:

```env
PORT=3000
NODE_ENV=development

DB_URI=

JWT_SECRET=
JWT_EXPIRES_IN=7d

ARCJET_KEY=
ARCJET_ENV=development

QSTASH_URL=
QSTASH_TOKEN=
QSTASH_CURRENT_SIGNING_KEY=
QSTASH_NEXT_SIGNING_KEY=

EMAIL_PASSWORD=

SERVER_URL=
```

---

# ▶️ Running the Server

Start the development server:

```bash
npm run dev
```

The backend will run on:

```text
http://localhost:3000
```

---

# 🗄️ MongoDB

The application uses **MongoDB** for persistent data storage.

**Mongoose** is used as the ODM to define schemas, validate data, and communicate with MongoDB.

The main models are:

### User

Stores user information such as:

```text
name
email
password
createdAt
updatedAt
```

Passwords are never stored as plain text.

They are hashed using **bcryptjs**.

### Subscription

A subscription contains information such as:

```text
name
price
currency
frequency
category
paymentMethod
status
startDate
renewalDate
user
createdAt
updatedAt
```

---

# 🔑 Authentication

Authentication is implemented using **JSON Web Tokens (JWT)**.

## Registration

A user creates an account with:

```text
POST /api/auth/sign-up
```

The password is hashed using `bcryptjs` before it is stored in MongoDB.

---

## Login

Users can log in using:

```text
POST /api/auth/sign-in
```

After successful authentication, the server generates a JWT.

The token is then used to access protected routes.

---

## Protected Requests

Protected API requests include the JWT in the authorization header:

```http
Authorization: Bearer <token>
```

The authentication middleware verifies the token before allowing access to protected resources.

---

# 🔒 Password Security

Passwords are hashed using **bcryptjs**.

Example:

```js
const hashedPassword = await bcrypt.hash(password, 10);
```

When logging in, the submitted password is compared with the stored hash:

```js
const isPasswordValid = await bcrypt.compare(
  password,
  user.password
);
```

This means the application does not store users' passwords as plain text.

---

# 💳 Subscription Management

Authenticated users can create subscriptions associated with their account.

A subscription includes:

```text
Name
Price
Currency
Frequency
Category
Payment Method
Start Date
Renewal Date
Status
User
```

Supported frequencies:

```text
daily
weekly
monthly
yearly
```

Supported statuses:

```text
active
cancelled
expired
```

---

# 📅 Automatic Renewal Dates

The backend automatically calculates the next renewal date based on the subscription frequency.

For example:

```text
Start Date:  September 29
Frequency:   monthly

Renewal:     October 29
```

The application uses **Day.js** for date calculations and timezone handling.

---

# 🇳🇵 Nepal Timezone

The application uses:

```text
Asia/Kathmandu
```

for subscription reminder calculations.

This is important because Nepal uses UTC+5:45.

The backend converts dates to Nepal time before performing calendar-based reminder calculations.

---

# 📧 Email Notifications

Email notifications are implemented using **Nodemailer**.

Gmail is used as the email provider during development.

The application sends automated subscription reminder emails.

Reminder types:

```text
7 days before reminder
5 days before reminder
2 days before reminder
1 day before reminder
```

---

# ✉️ Email Templates

Email templates are maintained separately so that the email content can be easily modified.

Example:

```text
7 days before reminder
```

Subject:

```text
📅 Reminder: Your subscription renews in 7 days
```

The email can contain information such as:

```text
User name
Subscription name
Price
Frequency
Payment method
Renewal date
```

---

# ⏰ Upstash Workflow

**Upstash Workflow** is responsible for scheduling subscription reminder jobs.

When a subscription is created, the backend triggers a workflow.

The workflow:

```text
Create Subscription
        ↓
Start Upstash Workflow
        ↓
Calculate Renewal Date
        ↓
Wait until 7 days before renewal
        ↓
Send Email
        ↓
Wait until 5 days before renewal
        ↓
Send Email
        ↓
Wait until 2 days before renewal
        ↓
Send Email
        ↓
Wait until 1 day before renewal
        ↓
Send Email
        ↓
Workflow Completed
```

---

# 🔔 Reminder Example

Suppose a subscription renews on:

```text
October 10, 2026
10:00 AM Nepal Time
```

The workflow schedules:

```text
October 3
→ 7-day reminder

October 5
→ 5-day reminder

October 8
→ 2-day reminder

October 9
→ 1-day reminder

October 10
→ Renewal date
```

If a reminder date has already passed when the workflow starts, that reminder is skipped and the workflow continues to the next reminder.

---

# 🛡️ Arcjet

**Arcjet** is used to add security and protection to the API.

It helps protect the backend against unwanted or abusive requests.

Arcjet is integrated into the Express application through middleware.

The backend can use it for request protection and security rules.

---

# 🌐 API Routes

The API is organized into different route groups.

Example structure:

```text
/api/auth
/api/subscriptions
/api/workflows
```

### Authentication

```text
POST /api/auth/sign-up
POST /api/auth/sign-in
```

### Subscriptions

```text
POST /api/subscriptions
GET  /api/subscriptions/:id
```

### Workflow

```text
POST /api/workflows/subscription/reminder
```

> Exact route names can vary depending on the current route configuration.

---

# 🧪 Testing Email Delivery

A development email endpoint can be used to verify Nodemailer configuration.

Example:

```text
GET /api/test-email
```

When successful, the backend sends a test email to the configured account.

This helps separate email configuration problems from workflow problems.

---

# 🔄 Complete Backend Flow

The overall application flow is:

```text
                 ┌──────────────┐
                 │    Client    │
                 └──────┬───────┘
                        │
                        ▼
                 ┌──────────────┐
                 │   Express    │
                 │     API      │
                 └──────┬───────┘
                        │
             ┌──────────┴──────────┐
             ▼                     ▼
      ┌─────────────┐       ┌─────────────┐
      │ JWT Auth    │       │   Arcjet    │
      └──────┬──────┘       └─────────────┘
             │
             ▼
      ┌─────────────┐
      │ Controllers │
      └──────┬──────┘
             │
             ▼
      ┌─────────────┐
      │  Mongoose   │
      └──────┬──────┘
             │
             ▼
      ┌─────────────┐
      │   MongoDB   │
      └─────────────┘

             Subscription Created
                     │
                     ▼
             ┌─────────────┐
             │   Upstash   │
             │  Workflow   │
             └──────┬──────┘
                    │
                    ▼
             Schedule Reminder
                    │
                    ▼
             ┌─────────────┐
             │ Nodemailer  │
             └──────┬──────┘
                    │
                    ▼
                📧 Email
```

---

# 🧰 Main Dependencies

The backend uses the following major packages:

```text
express
mongoose
bcryptjs
jsonwebtoken
nodemailer
@upstash/workflow
arcjet
dayjs
dotenv
```

---

# 🧑‍💻 Development

Start the backend:

```bash
npm run dev
```

If using the local Upstash/QStash development server:

```bash
npx @upstash/qstash-cli@latest dev
```

Then run the Node.js server separately:

```bash
npm run dev
```

---

# 🚨 Common Development Issues

### `Invalid email type`

Make sure the email template labels exactly match the workflow:

```text
7 days before reminder
5 days before reminder
2 days before reminder
1 day before reminder
```

---

### `next is not a function`

For synchronous Mongoose middleware, avoid using an unnecessary `next` parameter.

For example:

```js
subscriptionSchema.pre("validate", function () {
  // logic
});
```

---

### Workflow step-name errors

Upstash Workflow steps must remain deterministic between workflow replays.

Use fixed step names such as:

```text
Reminder 7 days before
Reminder 5 days before
Reminder 2 days before
Reminder 1 day before
```

---

# 🔐 Security Recommendations

Before deploying the application:

* Never commit `.env` files
* Never expose JWT secrets
* Never expose Gmail App Passwords
* Never expose QStash tokens or signing keys
* Use HTTPS in production
* Use a strong JWT secret
* Use environment variables for sensitive configuration
* Validate incoming API data
* Keep dependencies updated
* Restrict CORS to trusted frontend domains
* Use production database credentials
* Disable development-only test endpoints in production

---

# 🚀 Production Deployment

For production deployment, configure:

```env
NODE_ENV=production
```

and provide production values for:

```text
MongoDB
JWT
Arcjet
Upstash
Email
Server URL
```

The production workflow endpoint must be publicly reachable by Upstash Workflow.

Example:

```text
https://your-domain.com/api/workflows/subscription/reminder
```

Do not use:

```text
http://localhost:3000
```

for a production Upstash workflow.

---

# 📌 Future Improvements

Possible future improvements include:

* Subscription cancellation
* Subscription update
* Subscription deletion
* Dashboard analytics
* Monthly spending calculations
* Category-based spending statistics
* Push notifications
* Multiple email providers
* User notification preferences
* Subscription search and filtering
* Recurring subscription history
* Payment tracking
* Production deployment with CI/CD

---

# 👨‍💻 Author

**Ankit Maharjan**

Built as a backend project to practice:

```text
Node.js
Express.js
MongoDB
Mongoose
JWT Authentication
bcryptjs
Arcjet
Nodemailer
Upstash Workflow
REST API Development
```

---

## 📄 License

This project is intended for educational and development purposes.
