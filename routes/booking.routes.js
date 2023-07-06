import express, { response } from 'express';
import { verifyToken } from '../security/jwtUtils.js';
import { BookingModel } from '../models/Booking.js';
import { UserModel } from '../models/User.js';
import ClientModel from '../models/Client.js';
import PriceModel from '../models/Price.js';
import {getPriceForTwo, getPriceAdditionalPerson, getCleaningPrice, getPriceAnimal } from '../middlewares/PriceMiddlewares.js';
import { loadBooking, loadClient } from '../middlewares/InvoiceCreation.js';


const bookingRouter = express.Router();

//create new booking
bookingRouter.post("/create", verifyToken, getPriceForTwo, getPriceAdditionalPerson, getCleaningPrice, getPriceAnimal, async (req, res) => {

    const priceTwo = req.priceTwoNight;
    
    const priceAddtional = req.priceAdditionalNight;
    
    const priceCleaning = req.priceCleaning;
    
    const priceAnimal = req.priceAnimal;
    const numberOfNights = calculateNumberOfNights(req.body.arrivalDate, req.body.leavingDate);

    
    let totalPrice = calculateTotalPrice(priceTwo, priceAddtional, priceAnimal, req.body.numberOfAdults, req.body.numberOfChildren, req.body.numberOfAnimals, numberOfNights, priceCleaning);

    if(req.body.discount !== undefined) {
        totalPrice -= parseFloat(req.body.discount)
    }

    try {
        
        let bookingInformation = {
            flatNumber: req.body.flatNumber,
            numberOfAdults: req.body.numberOfAdults,
            numberOfChildren: req.body.numberOfChildren,
            numberOfAnimals: req.body.numberOfAnimals,
            arrivalDate: req.body.arrivalDate,
            leavingDate: req.body.leavingDate,
            pricePerNightTwo: priceTwo.toString(),
            pricePerNightAdditionalPerson: priceAddtional.toString(),
            cleaningPrice: priceCleaning.toString(),
            pricePerNightAnimal: priceAnimal.toString(),
            totalPrice: totalPrice.toString(),
            numberOfNights: numberOfNights,
            clientId: req.body.clientId,
            invoiceStatus: 0
            
        }
        if(req.body.discount !== undefined) {
            bookingInformation.discount = req.body.discount;
        }
        if(req.body.listOfNames !== undefined) {
            bookingInformation.listOfNames = req.body.listOfNames;

        }
        
        const booking = new BookingModel(bookingInformation);
        await booking.save();

        res.json(booking);

    } catch(err) {
        console.log(err);
        res.sendStatus(403);
    }

})


//create new client
bookingRouter.post("/client", verifyToken, async(req, res) => {
    try {
        const client = new ClientModel(req.body);
        await client.save();

        res.json(client);

    } catch(err) {
        console.log(err);
        res.sendStatus(500);
    }
})

//get all clients
bookingRouter.get("/client", verifyToken, async(req, res) => {
    try {

        const clients = await ClientModel.find();
        res.json(clients);

    } catch(err) {
        console.log(err);
        res.sendStatus(500);
    }
})

//get ceratin client by Id
bookingRouter.get("/client/:id", verifyToken, async(req, res) => {
    try {

        const client = await ClientModel.findOne({_id: req.params.id});
        res.json(client);

    } catch(err) {
        console.log(err);
        res.sendStatus(500);
    }
})


//check if a flat is available for the requested period of time
bookingRouter.post("/available", verifyToken, async(req, res) => {
    try {

        const flatNumber = req.body.flatNumber;
        const arrivalDate = createDateFromFormat(req.body.arrivalDate);
        const leavingDate = createDateFromFormat(req.body.leavingDate);
        const bookings = await BookingModel.find({flatNumber: flatNumber});
        
        bookings.forEach(function(booking) {
            const bookingArrivalDate = createDateFromFormat(booking.arrivalDate);
            const bookingLeavingDate = createDateFromFormat(booking.leavingDate);
            if(arrivalDate>=bookingArrivalDate && arrivalDate < bookingLeavingDate || leavingDate > bookingArrivalDate && leavingDate <= bookingLeavingDate) {
                return res.json({available: false})
            }
        })

        res.json({available: true});

    } catch(err) {
        console.log(err);
        res.sendStatus(500);
    }
})



//receive all existing bookings
bookingRouter.get("/all", verifyToken, async(req, res) => {
    try {
        console.log("empfangen")
        const bookings = await BookingModel.find();
        res.json(bookings.reverse());
    } catch(err) {
        console.log(err);
        res.sendStatus(500);
    }
})


//delete booking by Id
bookingRouter.delete("/delete/:id", verifyToken, async(req, res) => {
    try {
        await BookingModel.deleteOne({_id: req.params.id});
        res.sendStatus(200)
    } catch(err) {
        console.log(err);
        res.sendStatus(500)
    }
})



function calculateNumberOfNights(arrivalDateString, leavingDateString) {

    const arrivalDate = createDateFromFormat(arrivalDateString);
    const leavingDate = createDateFromFormat(leavingDateString);

    const millisecondsPerDay = 24 * 60 * 60 * 1000; // Number of milliseconds in a day

    const startTime = arrivalDate.getTime();
    const endTime = leavingDate.getTime();

    const timeDifference = endTime - startTime;
    const numberOfNights = Math.floor(timeDifference / millisecondsPerDay);

  return numberOfNights;
}


function createDateFromFormat(dateString) {
    const parts = dateString.split('-');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Months are zero-based (0-11)
    const year = parseInt(parts[2], 10);
  
    return new Date(year, month, day);
}

//calculates total price for the booking
function calculateTotalPrice(priceNightTwo, priceNightAdditional, priceNightAnimal, numberAdults, numberChildren, numberAnimals, nights, priceCleaning) {

    const basicPrice = nights * priceNightTwo;

    const numberAdditional = (parseInt(numberAdults) + parseInt(numberChildren)) - 2;


    const animalPrice = nights * priceNightAnimal * numberAnimals;


    //let total = basicPrice + animalPrice + priceCleaning;
    let total = parseFloat(animalPrice) + parseFloat(priceCleaning) + parseFloat(basicPrice);

    if(numberAdditional > 0) {
        total += (parseInt(priceNightAdditional) * parseInt(nights));
    }
    return total.toFixed(2);
}


//get all bookings without created invoice
bookingRouter.get("/no-invoice", verifyToken, async (req, res) => {
    try {
        const bookngs = await BookingModel.find({invoiceStatus: 0});

        res.json(bookings);
    } catch(err) {
        console.log(err);
        res.sendStatus(500);
    }
})


export {bookingRouter};
