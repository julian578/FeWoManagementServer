import mongoose from 'mongoose';

//Price objects are used to store the prices for certain services like the price per night for a flat or the cleaning costs


const priceSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: true,
        unique: true
    },
    price: {
        type: Number,
        required: true
    }
})

const PriceModel = mongoose.model("Price", priceSchema);

export default PriceModel;