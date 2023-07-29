import jwt from 'jsonwebtoken';


//generate jwt token when user tries to log in
async function createToken(user) {

    try {
        return new Promise((resolve, reject) => {
            console.log(user)
            jwt.sign({user: user}, "secretkey", (err, token) => {
                if(err) {
                    console.log(err)
                    reject("wrong username or password");
                }
                else resolve(token)
            })
        })
    } catch(err) {
        console.log(err);
        res.sendStatus(500);
    }

    

}


//verify jwt for every request
async function verifyToken(req, res, next) {

    
    
    try {
        const token = extractToken(req, res);
        jwt.verify(token, "secretkey", (err, authData) => {
            if(err) {
                console.log(err);
                res.sendStatus(403);
            } else {

                console.log(token)
                req.token = token;
                
                return next();  
            }
        })
    } catch(err) {
        consolge.log(err);
        res.sendStatus(403);
    }

}


//extract the jwt from request headers
function extractToken(req, res) {
    try {
        const bearer = req.headers["authorization"];
        
        const token = bearer.substring(7);

        return token;
    } catch(err) {
        console.log(err);
        res.sendStatus(403);
    }
}

export {createToken, verifyToken};