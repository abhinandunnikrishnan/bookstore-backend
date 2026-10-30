const jwt =require('jsonwebtoken')
const adminMiddleware =(req,res,next)=>{
    console.log("inside adminMiddleware middleware");
    const token = req.headers['authorization'].split(" ")[1]
    if(token){
        try{
        const jwtResponse=jwt.verify(token,process.env.JWTSECRET)
        console.log(jwtResponse);
        req.payload = jwtResponse.userMail
        const role=jwtResponse.role
        if(role=="admin"){
            next()
        }else{
            res.status(401).json("Not An Authorized User")
        }
        
    }catch(err){
        res.status(401).json("Invalid Token...")
    }
    }else{
        res.status(401).json("Not an Authorised user...")
    }
    
    
}
module.exports=adminMiddleware