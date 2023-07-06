import express from 'express';
import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User.js';
import { createToken } from '../security/jwtUtils.js';

const userRouter = express.Router();

//register new user
userRouter.post("/register", async(req, res) => {
        
        var transmittedUser = req.body;
        
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(transmittedUser.password, salt, async (err, hash) => {
                if(err)return res.sendStatus(500);
                transmittedUser.password = hash;
                try {
                    const user = new UserModel(transmittedUser);
                    console.log(user);
            
                    await user.save();
                    res.json(user);
                } catch(err) {
                    res.sendStatus(400)
                }
                
            })
        })


})



//login as user
userRouter.post("/login", async(req, res) => {
    try {

        
        
        const user = await UserModel.find({name: req.body.name});
        

        await bcrypt.compare(req.body.password, user[0].password, (err, result) => {
            if(err) return res.sendStatus(403);
            if(result) {
                createToken(user[0]).then((token) => {
                    
                    return res.json({"jwt": token})})
            }
            else return res.sendStatus(400)
            


        } )

    } catch(err) {
        res.sendStatus(403)
    }
})

userRouter.get("/all", async (req, res) => {
    const user = await UserModel.find();
    res.json(user)
})

//delete user by id
userRouter.delete("/delete/:_id", async (req, res) => {
    try {
        await UserModel.deleteOne({_id:req.params._id})
        res.sendStatus(200)
    } catch(err){
        console.log(err);
        res.sendStatus(500);
    } 
    
})


export{userRouter};



