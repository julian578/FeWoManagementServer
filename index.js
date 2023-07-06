import express from 'express';
import mongoose from 'mongoose';
import { userRouter } from './routes/user.routes.js';
import { bookingRouter } from './routes/booking.routes.js';
import 'dotenv/config'
import priceRouter from './routes/price.routes.js';
import invoiceRouter from './routes/invoice.routes.js';



const app = express();
const port = process.env.PORT;
const dbUrl = process.env.DB_URL

app.use(express.json());
app.use("/api/user", userRouter);
app.use("/api/booking", bookingRouter);
app.use("/api/price", priceRouter);
app.use("/api/invoice", invoiceRouter);

mongoose.connect(dbUrl)



app.listen(port, () => console.log("server running on port: "+port));