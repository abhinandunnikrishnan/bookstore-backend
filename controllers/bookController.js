const books = require("../models/bookModel")
const stripe = require('stripe')(process.env.STRIPE_SK);
const {GoogleGenerativeAI}=require('@google/generative-ai');
const { googleLoginController } = require("./userController");

// add book
exports.addBookController=async(req,res)=>{
    console.log("inside addBookController");
    // get book details from req body 
    const{title,author,imageUrl,pages,price,discountedPrice,abstract,publisher,isbn,language,category}=req.body
    const uploadImages=req.files.map(item=>item.filename)
    const sellerMail=req.payload
    console.log(title,author,imageUrl,pages,price,discountedPrice,abstract,publisher,isbn,language,category,uploadImages,sellerMail);
    // check book exists or not
    const existingBook = await books.findOne({title,sellerMail})
    // book already exist
    if(existingBook){
        res.status(409).json("Book Already Exist")
    }else{
        // add book
        const newBook=await books.create({title,author,imageUrl,pages,price,discountedPrice,abstract,publisher,isbn,language,category,uploadImages,sellerMail})
        res.status(201).json(newBook)
    }
}


// get latest books :get 4 book
exports.getHomeBookController=async(req,res)=>{
    console.log("inside getHomeBookController");
    const homeBooks= await books.find().sort({_id:-1}).limit(4)
    res.status(200).json(homeBooks)
    
}

// get all books : ignore books uploaeded by logined user 
exports.getAllBooksController=async(req,res)=>{
    console.log("inside getAllBooksController");
    const loginUserMail=req.payload
    const searchKey=req.query.search
    const allBooks= await books.find({sellerMail:{$ne:loginUserMail},title:{$regex:searchKey,$options:"i"}})
    res.status(200).json(allBooks)
    
}

// get logined user updated books
exports.getUserBooksController=async(req,res)=>{
    console.log("inside getUserBooksController");
    const loginUserMail=req.payload
    const userBooks= await books.find({sellerMail:loginUserMail})
    res.status(200).json(userBooks)
    
}

// get logined user purchased books
exports.getUserBroughtBooksController=async(req,res)=>{
    console.log("inside getUserBroughtBooksController");
    const loginUserMail=req.payload
    const userBroughtBooks= await books.find({buyerMail:loginUserMail})
    res.status(200).json(userBroughtBooks)
    
}


// delete uploaded by logined user
exports.DeleteBooksController=async(req,res)=>{
    console.log("inside DeleteBooksController");
    const {id}=req.params
    const deleteBook= await books.findByIdAndDelete({_id:id})
    res.status(200).json(deleteBook)
    
}


// get a single book to view 
exports.viewBookController=async(req,res)=>{
    console.log("inside viewBookController");
    const {id}=req.params
    const bookDetails= await books.findById({_id:id})
    res.status(200).json(bookDetails)
    
}


// get all books :admin page
exports.getAllBookController=async(req,res)=>{
    console.log("inside getAllBookController");
    const allBooks= await books.find()
    res.status(200).json(allBooks)
    
}

// update book status :admin page
exports.updateBookStatusController=async(req,res)=>{
    console.log("inside updateBookStatusController");
    const {id}=req.params
    const booksDetails= await books.findById({_id:id})
    booksDetails.status="approved"
    await booksDetails.save()
    res.status(200).json(booksDetails)
}

// book payment
exports.bookPaymentController=async(req,res)=>{
    console.log("inside bookPaymentController");
    const buyerMail=req.payload
    const {id}=req.params
    const bookDetails= await books.findById({_id:id})
    bookDetails.status="sold"
    bookDetails.buyerMail=buyerMail
    await bookDetails.save()
    
    // create stripe checkout session
    const line_items=[{
        price_data :{
            currency: "usd",
            product_data : {
                name:bookDetails.title,
                description:`${bookDetails.author},${bookDetails.publisher}`,
                // images:bookDetails.uploadImages,
                metadata:{
                    title:bookDetails.title,author:bookDetails.author,price:bookDetails.discountedPrice
                },
            },
            unit_amount:Math.round(bookDetails.discountedPrice)*100
        },
        quantity:1
    }]
    const session = await stripe.checkout.sessions.create({
        success_url : "http://localhost:5173/success",
        cancel_url : "http://localhost:5173/failed",
        line_items,
        mode:"payment",
        allowed_payment_method_types:["card"],

    })
    console.log(session);
    res.status(200).json({checkOutURL:session.url})
    
}

// get book Abstract using gemini api
exports.generativeAbstractAPIController=async(req,res)=>{
    console.log("inside generativeAbstractAPIController");
    const genAI =new GoogleGenerativeAI(process.env.GEMINI_API)
    const {title}=req.body
    const model=genAI.getGenerativeModel({
        model:"gemini-3.5-flash-lite"
    })
    const result=await model.generateContent(`Give me a short Abstract,isbn,author name,book cover image url,publisher name, language and category of the book ${title} in json format`)
    let replay=result.response.candidates[0].content.parts[0].text;

    // remove markdown code fences
    replay = replay.replace(/```json|```/g,"").trim()

    // convert string into json
    const bookData= JSON.parse(replay)
    console.log(bookData);
    
    // extract abstract
    const abstract =bookData.abstract
    const author=bookData.author
    const isbn = bookData.isbn
    const language=bookData.language
    const category =bookData.category
    const publisher=bookData.publisher
    const book_cover_image_url=bookData.book_cover_image_url

    // console.log(replay);
    res.status(200).json({
        sucess:true,
        user:title,
        content:{abstract,author,isbn,language,category,publisher,book_cover_image_url}
    })
    
}
