const jwt =require('jsonwebtoken')
const authMiddleware =(req,res,next)=>{
    console.log("inside authentication middleware");
    const token = req.headers['authorization'].split(" ")[1]
    if(token){
        try{
        const jwtResponse=jwt.verify(token,process.env.JWTSECRET)
        console.log(jwtResponse);
        req.payload = jwtResponse.userMail
        next()
    }catch(err){
        res.status(401).json("Invalid Token...")
    }
    }else{
        res.status(401).json("Not an Authorised user...")
    }
    
    
}
module.exports=authMiddleware