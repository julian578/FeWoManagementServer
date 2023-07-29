import mongoose from 'mongoose';
//Client object contains the personal information of a client who made a booking


const clientSchema = new mongoose.Schema({
    gender: String,
    fullName: String,
    mobilePhone: String,
    phone: String,
    email: String,
    street: String,
    houseNumber: String,
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