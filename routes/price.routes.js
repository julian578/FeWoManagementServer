import express from "express"
import { verifyToken } from "../security/jwtUtils.js";
import priceModel from "../models/Price.js";
import PriceModel from "../models/Price.js";


const priceRouter = express.Router()

//create new Price Object and safe it in the db
priceRouter.post("/", verifyToken, async(req, res) => {
    try {
        const price = new PriceModel(req.body);

        await price.save();

        res.json(price);

    } catch(err) {
        console.log(err);
        res.sendStatus(500);
    }
})


//update the price of an existing price object
priceRouter.put("/:subject", verifyToken, async(req, res) => {
    try {

        let price = await PriceModel.findOne({subject: req.params.subject});
        
        const update = {price: req.body.newPrice};

        await price.updateOne(update);

        res.sendStatus(200);

    } catch(err) {
        console.log(err);
        res.sendStatus(500);
    }
})

//get price object by it's value
priceRouter.get("/:subject", verifyToken, async(req, res) => {
    try {

        const price = await PriceModel.findOne({subject: req.params.subject});
        res.json(price);
    } catch(err) {
        console.log(err);
        res.sendStatus(500);
    }
})


//get all price objects
priceRouter.get("/", verifyToken, async(req, res) => {
    const prices = await PriceModel.find();
    res.json(prices);
})





export default priceRouter;