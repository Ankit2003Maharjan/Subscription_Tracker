import express from 'express';
import cookieParser from 'cookie-parser';
import {PORT} from './config/env.js';
import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';
import subscriptionRouter from './routes/subscription.routes.js';
import connectDB from './database/mongodb.js';
import errorMiddleware from './middlewares/error.middleware.js';
import workflowRouter from './routes/workflow.routes.js';
import testEmailRouter from "./routes/test-email.routes.js";
import arcjetMiddleware from './middlewares/arcjet.middleware.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use (arcjetMiddleware);

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/subscriptions', subscriptionRouter);
app.use('/api/workflows', workflowRouter);
app.use("/api", testEmailRouter);
app.use(errorMiddleware);


app.listen(PORT, async () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
  await connectDB();
});

export default app;