import express from 'express';
import { verifyToken } from '../security/jwtUtils.js';
import InvoiceModel from '../models/Invoice.js';
import { createInvoice, generateInvoiceData, loadBooking, loadClient } from '../middlewares/InvoiceCreation.js';


const invoiceRouter = express.Router();

//generate new invoice
invoiceRouter.post("/", verifyToken, loadBooking, loadClient, generateInvoiceId, generateInvoiceData, createInvoice, async(req, res ) => {
    try {
        const booking = req.booking;

        //invoice status updated to 1, which means that an invoice for this booking is generated
        const update = {invoiceStatus: 1};
        await booking.updateOne(update);   
        res.sendStatus(200);
    } catch(err) {
        console.log(err);
        res.sendStatus(500);
    }
    
})



//get all invoices
invoiceRouter.get("/", verifyToken, async(req, res) => {
    try {

        const invoices = await InvoiceModel.find();
        res.json(invoices);
    } catch(err) {
        console.log(err);
        res.sendStatust(500);
    }
})


//get invoice by bookingId
invoiceRouter.get("/:booking", verifyToken, async(req, res) => {
    try {

        const invoice = await InvoiceModel.findOne({booking: req.params.booking});
        res.json(invoice);
    } catch(err) {
        console.log(err);
        res.sendStatust(500);
    }
})

export default invoiceRouter;


async function generateInvoiceId(req, res, next) {
    const invoices = (await InvoiceModel.find()).reverse();
    if(invoices.length > 0) {
        req.invoiceId = invoices[0].invoiceId + 1
    } else {

        req.invoiceId = 1;
    
    }

    return next();
}