import PriceModel from "../models/Price.js";

//get total price for two persons
async function getPriceForTwo(req, res, next) {
    try {

        console.log("angekommen price for two")
        const flatNumber = req.body.flatNumber;
        console.log("number:" +  flatNumber)
        const subject = String.fromCharCode(64 + flatNumber)+"_PRICE_PER_NIGHT_TWO";
        const priceModel = await PriceModel.findOne({subject: subject});
        req.priceTwoNight = priceModel.price.toFixed(2);
        console.log("Preis: "+req.priceTwoNight)
        return next();

    } catch(err) {
        console.log(err);
        res.sendStatus(500);
    }

}

//get total price for additional persons(only if there are more than 2 persons in the flat)
async function getPriceAdditionalPerson(req, res, next) {
    try {

        const flatNumber = req.body.flatNumber;
        //flat K can only accept two guests
        if(flatNumber === 11) {
            req.priceAdditionalNight = 0;
            console.log("raus")
            return next();
        } else {
            const subject = String.fromCharCode(64 + flatNumber)+"_PRICE_PER_FURTHER_PERSON";
            console.log(subject)
            const priceModel = await PriceModel.findOne({subject: subject});
            req.priceAdditionalNight = priceModel.price.toFixed(2);
            return next();
        }
        

    } catch(err) {
        console.log(err);
        res.sendStatus(500);
    }
}

//generated cleaning price depending on whether the guests had animals with them
async function getCleaningPrice(req, res, next) {
    try {

        console.log("cleaning")
        
        if(req.body.numberOfAnimals == 0) {
            
            await PriceModel.findOne({subject: "CLEANING_WITHOUT_ANIMAL"}).then((price) => {
                req.priceCleaning =price.price.toFixed(2);
                return next();
            })
        } else {
            await PriceModel.findOne({subject: "CLEANING_WITH_ANIMAL"}).then((price) => {
                req.priceCleaning = price.price.toFixed(2);
                return next();
            })
        }

    } catch(err) {
        console.log(err);
        res.sendStatus(500);
    }
}

//calculated the total price for animals
async function getPriceAnimal(req, res, next) {
    try {

    
        const priceModel = await PriceModel.findOne({subject: "PRICE_PER_ANIMAL_PER_NIGHT"});
        req.priceAnimal = priceModel.price.toFixed(2);
        return next();

    } catch(err) {
        console.log(err);
        res.sendStatus(500);
    }
}



export {getPriceForTwo, getPriceAdditionalPerson, getCleaningPrice, getPriceAnimal}