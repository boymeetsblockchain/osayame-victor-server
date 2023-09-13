const express = require("express")
const protect= require('../middlewares/authMiddleware')
const { registerUser, loginUser, deleteUser, getUser, loginStatus,changePassword } = require("../controller/userController")

const router = express.Router()


router.post('/register',registerUser)
router.post('/login',loginUser)
router.delete('/delete',deleteUser)
router.put('/password',changePassword)
router.get('/getuser',protect,getUser)
router.get('/loggedin',protect,loginStatus)


module.exports =router