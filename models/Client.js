import mongoose from 'mongoose';
//Client object contains the personal information of a client who made a booking


const clientSchema = new mongoose.Schema({
    gender: String,
    fullName: String,
    mobilePhone: {
        type: String,
        required: false,
    },
    phone: {
        type: String,
        required: false
    },
    email: String,
    street: String,
    houseNumber: Number,
    postalCode: String,
    city: String,
    country: String,
    taxId: {
        required: false,
        type: String
    }
})

const ClientModel = mongoose.model("Client", clientSchema);

export default ClientModel;