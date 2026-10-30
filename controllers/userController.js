const bcrypt=require('bcrypt')
const users=require("../models/userModel")
const jwt =require('jsonwebtoken')
// register
exports.registerController=async(req,res)=>{
    console.log("inside registerController");
    console.log(req.body);
    const{username,email,password}=req.body
    // check email in db
    const existingUser=await users.findOne({email})
    if(existingUser){
        res.status(409).json("user already exist.. Please Login")
    }else{
        // insert new document to db
        let encryptPassword=await bcrypt.hash(password,10)
        const newUser=await users.create({
            username,email,password:encryptPassword
        })
        res.status(201).json(newUser)
    }
    
    res.status(201).json("Register request received")
}

// login
exports.loginController=async(req,res)=>{
    console.log("inside loginController");
    console.log(req.body);
    const{email,password}=req.body
    // check email in db
    const existingUser=await users.findOne({email})
    if(existingUser){
        // check password
        const isPasswordMatch= await bcrypt.compare(password,existingUser.password)
        if(isPasswordMatch){
            const token =jwt.sign({userMail:email,role:existingUser.role},process.env.JWTSECRET)
            res.status(200).json({user:existingUser,token})
        }else{
           res.status(409).json("Invalid password") 
        }
    }else{
        res.status(409).json("Invalid email")
    }
    
    
}

// google login
exports.googleLoginController=async(req,res)=>{
    console.log("inside googleLoginController");
    
    const{email,password,picture,username}=req.body
    // check email in db
    const existingUser=await users.findOne({email})
    if(existingUser){
        // if present
            const token =jwt.sign({userMail:existingUser.email,role:existingUser.role},process.env.JWTSECRET)
            console.log(existingUser);
            
            res.status(200).json({user:existingUser,token})
        
    }else{
        // if not present register user
        let encryptPassword=await bcrypt.hash(password,10)
        const newUser=await users.create({
            username,email,password:encryptPassword,picture
        })
        const token =jwt.sign({userMail:newUser.email,role:newUser.role},process.env.JWTSECRET)
        res.status(200).json({user:newUser,token})
        
    }
    
    
}

// user/admin edit
exports.userEditController=async(req,res)=>{
    console.log("inside user/admineditController");
    const{id}=req.params
    const email=req.payload
    const{username,password,bio,picture,role}=req.body
    const encryptedPassword=await bcrypt.hash(password,10)
    const uploadedPicture=req.file?req.file.filename:picture
    const updatedUser=await users.findByIdAndUpdate({_id:id},{username,email,password:encryptedPassword,picture:uploadedPicture,bio,role},{new:true})
    res.status(200).json(updatedUser) 
}

// get all users
exports.getAllUsersController=async(req,res)=>{
    console.log("inside getAllUsersController");
    const email=req.payload
    const allUsers=await users.find({email:{$ne:email}})
    res.status(200).json(allUsers)
    
}
