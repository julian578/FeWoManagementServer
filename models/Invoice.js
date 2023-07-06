import mongoose from 'mongoose';
//import autoIncrement from 'mongoose-auto-increment';
import 'dotenv/config'

//invoice objects generate an invoiceId for every invoice that can be found on the invoice and it stores the bookingId of the booking the invoice is created for


//var connection = mongoose.createConnection(process.env.DB_URL)
//autoIncrement.initialize(connection)

const invoiceSchema = new mongoose.Schema({

    date: String,
    booking: mongoose.Schema.Types.ObjectId,
    invoiceId: Number
})



const InvoiceModel = mongoose.model("Invoice", invoiceSchema);

export default InvoiceModel;
