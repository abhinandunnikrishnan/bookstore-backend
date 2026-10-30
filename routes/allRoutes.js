const express =require("express")
const userController=require("../controllers/userController")
const authMiddleware = require("../middlewares/authMiddleware")
const multerMiddleware = require("../middlewares/multerMiddleware")
const bookContoller=require("../controllers/bookController")
const adminMiddleware = require("../middlewares/adminMiddleware")

// object for router class in express
const router=new express.Router()

// register
router.post("/register",userController.registerController)

// login
router.post("/login",userController.loginController)

// google login 
router.post("/google-login",userController.googleLoginController)

// get home books
router.get("/home-books",bookContoller.getHomeBookController)

// ------------------------Authorized acces-------------------------

// user edit 
router.put("/user/:id",authMiddleware,multerMiddleware.single('picture'),userController.userEditController)

// add book
router.post("/book",authMiddleware,multerMiddleware.array('uploadImages',3),bookContoller.addBookController)

// get all books
router.get("/all-books",authMiddleware,bookContoller.getAllBooksController)

// get user uploaded books
router.get("/user-books",authMiddleware,bookContoller.getUserBooksController)

// get user buyed books
router.get("/brought-books",authMiddleware,bookContoller.getUserBroughtBooksController)

// delete user uploaded books
router.delete("/book/:id",authMiddleware,bookContoller.DeleteBooksController)

// get view books
router.get("/view-book/:id",authMiddleware,bookContoller.viewBookController)

// get abstract via ai book
router.post("/book-ai",authMiddleware,bookContoller.generativeAbstractAPIController)

// book payment
router.put("/books/:id/buy",authMiddleware,bookContoller.bookPaymentController)

// -----------------------------AUTHORIZED ACCESS----------------------------

// edit admin
router.put("/admin/:id",adminMiddleware,multerMiddleware.single('picture'),userController.userEditController)

// get all users
router.get("/user-list",adminMiddleware,userController.getAllUsersController)

// get all books
router.get("/book-list",adminMiddleware,bookContoller.getAllBookController)

// update book status
router.put("/book/:id",adminMiddleware,bookContoller.updateBookStatusController)

module.exports=router
