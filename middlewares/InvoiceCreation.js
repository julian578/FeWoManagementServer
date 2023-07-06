import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import fs from 'fs';

import {BookingModel} from "../models/Booking.js";
import InvoiceModel from "../models/Invoice.js";
import ClientModel from "../models/Client.js";

/*
abbreviation for data on the invoice template:

Geschlecht: g,
Vollständiger Name: n,
Straße und Hausnummer: sn,
PLZ und Stadt: ps,
Land: l,
Telefon: t,
Handynummer: h,
Email: em,
Buchungsnummer: bn,
Datum: dt
Anreise: an,
Abreise: ab,
Zimmertyp: zt
Total Personen: tp,
Anzahl Erwachsene: anzE,
Anzahl Kinder: anzK,
Liste Namen der Gäste: nms
Preis für 2 Personen/Nacht: p2pN,
Preis für 2 Personen: p2p,
Preis für weitere Personen/Nacht: pwpN,
Preis für weitere Personen: pwp
Anzahl weitere Personen: awp,
Anzahl Nächte: anzN,
Anzahl Tiere: anzT,
Preis Tier/Nacht: pTN,
Toal Preis tiere: tpt
Preis Endreinigung: pER,
Total Preis: tPreis,
Mehrwertsteuer: mwst,
Hinweistext Ende (Anzahlung, Fälligkeitsdatum): hwt,
Rabatt: dc


*/



//generated all the data that can be found on the invoice except for the invoiceId(that is created leter)
async function generateInvoiceData(req, res, next) {

    try {
        const booking = req.booking;
        const client = req.client;

        

        var currentDate = new Date()
        var day = currentDate.getDate()
        var month = currentDate.getMonth() + 1
        var year = currentDate.getFullYear()

        const date = day + "-" + month + "-" + year;
        
        req.date = date;

        let roomtype = String.fromCharCode(64 + booking.flatNumber);

        var numberFurtherPersons;
        
        if(booking.numberOfAdults + booking.numberOfChildren <= 2) {
            numberFurtherPersons = 0;
        }
        else {
            numberFurtherPersons = (booking.numberOfAdults + booking.numberOfChildren) -2;        
        }

        const priceTwoPersons = (parseFloat(booking.numberOfNights) * parseFloat(booking.pricePerNightTwo)).toFixed(2);
        const priceFurtherPersons = (parseFloat(booking.numberOfNights) * parseFloat(booking.pricePerNightAdditionalPerson) * numberFurtherPersons).toFixed(2);
        const priceAnimals = (parseFloat(booking.numberOfNights) * parseFloat(booking.pricePerNightAnimal) * parseFloat(booking.numberOfAnimals)).toFixed(2);

  

        const totalPrice = parseFloat(booking.totalPrice).toFixed(2);
        var tax = (totalPrice/107) * 7;
        const roundTax = tax.toFixed(2);


        const text = generateInvoiceText(createDateFromFormat(date), booking.arrivalDate, totalPrice);

        
        let data = {
            g: client.gender,
            n: client.fullName,
            sn: client.street+" "+client.houseNumber,
            ps: client.postalCode+" "+client.city,
            l: client.country,
            t: client.phone,
            h:client.mobilePhone,
            em: client.email,
            dt: date.replaceAll("-", "."),
            an: booking.arrivalDate.replaceAll("-", "."),
            ab: booking.leavingDate.replaceAll("-", "."),
            zt: "Wohnung " + roomtype,
            tp: booking.numberOfAdults + booking.numberOfChildren,
            anzE: booking.numberOfAdults,
            anzK: booking.numberOfChildren,
            nms: booking.listOfNames,
            p2pN: booking.pricePerNightTwo.toString().replaceAll(".", ","),
            p2p: priceTwoPersons.toString().replaceAll(".", ","),
            pwpN: booking.pricePerNightAdditionalPerson.toString().replaceAll(".", ","),
            awp: numberFurtherPersons,
            pwp: priceFurtherPersons.toString().replaceAll(".", ","),
            pTN: booking.pricePerNightAnimal.toString().replaceAll(".", ","),
            anzT: booking.numberOfAnimals,
            tpt: priceAnimals.toString().replaceAll(".", ","),
            pER: booking.cleaningPrice.toString().replaceAll(".", ","),
            tPreis: totalPrice.toString().replaceAll(".", ","),
            mwst: roundTax.toString().replaceAll(".", ","),
            hwt: text,
            anzN: booking.numberOfNights,
            bn: req.invoiceId
            
        }

        if(data.t === undefined) {
            data.t="";
        }
        if(data.h === undefined) data.h="";

        if(data.nms === undefined) data.nms="";

        if(booking.discount !== undefined) {
            data.dc = "Rabatt (-) EUR   "+parseFloat(booking.discount).toFixed(2).toString().replaceAll(".", ",")
        } else {
            data.dc = ""
        }

        console.log(data)
        req.invoiceData = data;

        return next();

    } catch(err) {
        console.log(err);
        res.sendStatus(500);
    }
}

//generated text at the end of the invoice describing when the payment must be made
function generateInvoiceText(invoiceDate, arrivalDateString, totalPrice) {
    const arrivalDate = createDateFromFormat(arrivalDateString);
    if(!IsAtLeastXDaysBefore(14, invoiceDate, arrivalDate)) {
        return "Bitte leisten sie die Zahlung des vollständigen Betrags schnellstmöglich, aber spätestens bis Antritt der Reise."
    } else if(!IsAtLeastXDaysBefore(45, invoiceDate, arrivalDate)) {

        
        const downPayment = (totalPrice * 0.2).toFixed(2);
        const remaining = (totalPrice-downPayment).toFixed(2);
        const dateOneWeekAhead = new Date(invoiceDate.getTime()+ 7 * 24 * 60 * 60 * 1000);
        const dateOneWeekAheadString = dateOneWeekAhead.getDay()+"."+dateOneWeekAhead.getMonth()+"."+dateOneWeekAhead.getFullYear();
        return "Bitte leisten Sie eine Anzahlung von 20 % in Höhe von "+ downPayment.toString().replaceAll(".", ",") +"€ bis zum "+ dateOneWeekAheadString + ", die Restzahlung in Höhe von  "+ remaining.toString().replaceAll(".", ",") + "€ ist 2 Wochen vor dem Anreisetag fällig."
    } else {
        
        const downPayment = (totalPrice * 0.2).toFixed(2);
        const remaining = (totalPrice-downPayment).toFixed(2);
        const dateOneWeekAhead = new Date(invoiceDate.getTime()+ 7 * 24 * 60 * 60 * 1000);

        const dateOneWeekAheadString = dateOneWeekAhead.getDate()+"."+(dateOneWeekAhead.getMonth()+1)+"."+dateOneWeekAhead.getFullYear();
        
        return "Bitte leisten Sie eine Anzahlung von 20 % in Höhe von "+ downPayment.toString().replaceAll(".", ",") +"€ bis zum "+ dateOneWeekAheadString + ", die Restzahlung in Höhe von  "+ remaining.toString().replaceAll(".", ",") + "€ ist 4 Wochen vor dem Anreisetag fällig."
    }
}



function createDateFromFormat(dateString) {
    const parts = dateString.split('-');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Months are zero-based (0-11)
    const year = parseInt(parts[2], 10);
  
    return new Date(year, month, day);
}

function IsAtLeastXDaysBefore(x, firstDate, secondDate) {
    const millisecondsPerDay = 24 * 60 * 60 * 1000; // Number of milliseconds in a day

    // Calculate the difference in milliseconds between the two dates
    const timeDiff = secondDate.getTime() - firstDate.getTime();
  
    // Calculate the number of days between the two dates
    const daysDiff = Math.floor(timeDiff / millisecondsPerDay);
  
    // Check if the first date is at least 14 days before the second date
    return daysDiff >= x;
}
    



//generated the invoice as .docx document using the invoice data created in another middleware
async function createInvoice(req, res, next) {

    try {
        var data = req.invoiceData;
        const invoice = new InvoiceModel({
            date: req.date,
            booking: req.booking._id,
            invoiceId: req.invoiceId
        })
    
        await invoice.save();

        

        const content = fs.readFileSync('./assets/template.docx', 'binary');
       
        let zip = PizZip(content);

        let templateDoc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true
        })
        templateDoc.setData(data);

        templateDoc.render(data);
        const fileName = "Rechnung(invoice)_"+data.n+"_"+data.bn+".docx";
        const outputFile = './invoices/'+fileName;
        const outputContent = templateDoc.getZip().generate({ type: 'nodebuffer' });

        // Save the generated document
        fs.writeFileSync(outputFile, outputContent);
        return next();

    } catch(err) {
        console.log(err);
        res.sendStatus(500);
    }

}




async function loadBooking(req, res, next) {
    const booking = await BookingModel.findById(req.body.bookingId);
    req.booking = booking;
    console.log(booking)

    return next();
}

async function loadClient(req, res, next) {
    try {
        const booking  = req.booking;
        console.log("client Id");
        console.log(booking.clientId.toString())
        const client = await ClientModel.findById(booking.clientId.toString());
        
        req.client = client;
        
        return next();


    } catch(err) {
        console.log(err);
        return res.sendStatus(500);
        
    }
}

export {generateInvoiceData, createInvoice, loadBooking, loadClient}