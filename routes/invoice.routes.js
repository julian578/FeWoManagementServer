import express from 'express';
import { verifyToken } from '../security/jwtUtils.js';
import InvoiceModel from '../models/Invoice.js';
import { createInvoice, generateInvoiceData, loadBooking, loadClient } from '../middlewares/InvoiceCreation.js';
import { BookingModel } from '../models/Booking.js';
import ClientModel from '../models/Client.js';


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

//get invoice by invoiceId
invoiceRouter.get("/invoiceId/:invoiceId", verifyToken, async(req, res) => {

    try {

        const invoice = await InvoiceModel.findOne({invoiceId: req.params.invoiceId});
        res.json(invoice);
    } catch(err) {
        res.sendStatus(500);
    }
});



//get invoice by bookingId
invoiceRouter.get("/:booking", verifyToken, async(req, res) => {
    try {

        const invoice = await InvoiceModel.findOne({booking: req.params.booking});
        res.json(invoice);
    } catch(err) {
        console.log(err);
        res.sendStatus(500);
    }
})



invoiceRouter.get("/booking/:clientId", verifyToken, async(req, res) => {

    try {

        const booking = await BookingModel.findOne({clientId: req.params.clientId});
        res.json(booking);
    } catch(err) {
        console.log(err);
        res.sendStatus(500);
    }
});


invoiceRouter.delete("/all", verifyToken, async(req, res) => {

    try {
        await InvoiceModel.deleteMany();
        res.sendStatus(200);
    } catch(err) {
        console.log(err);
        res.sendStatus(500);
    }
});

async function generateInvoiceId(req, res, next) {
    const invoices = (await InvoiceModel.find()).reverse();
    if(invoices.length > 0) {
        req.invoiceId = invoices[0].invoiceId + 1
    } else {

        req.invoiceId = 50000001;
    
    }

    return next();
}

export default invoiceRouter;