import mongoose from 'mongoose';
//booking objects contain all relevant information of a booking and store the clientId of the client who made the booking


const bookingSchema = new mongoose.Schema({

    flatNumber: Number,
    numberOfAdults: Number,
    numberOfChildren: Number,
    numberOfAnimals: Number,
    arrivalDate: String,
    leavingDate: String,
    pricePerNightTwo: String,
    pricePerNightAdditionalPerson: String,
    cleaningPrice: String,
    pricePerNightAnimal: String,
    totalPrice: String,
    listOfNames: {
        type: String,
        required: false
    },
    numberOfNights: Number,
    discount: {
        type: String,
        required: false
    },
    clientId: mongoose.Schema.Types.ObjectId,
    //0: no invoice created, 1: invoice created not sent to the client
    invoiceStatus: Number

})

const BookingModel = mongoose.model("Booking", bookingSchema);

export {BookingModel};