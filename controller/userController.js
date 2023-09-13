const asyncHandler = require ('express-async-handler')
const User = require('../models/userModel')
const bcrypt = require('bcryptjs')
const jwt= require('jsonwebtoken')
// generate token 
const generateToken =(id)=>{
  return jwt.sign({id},process.env.JWT_SECRET,{expiresIn:"1d"})
}
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, imagearr } = req.body;

  if (!name || !email || !password || !imagearr) {
    res.status(400);
    throw new Error("Please fill in all fields");
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error("Password must be at least 6 characters");
  }

  const userExist = await User.findOne({ email });

  if (userExist) {
    res.status(400);
    throw new Error("Email has already been registered");
  }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
  const user = await User.create({
    name,
    email,
    password:hashedPassword,
    imagearr,
  });
 // generate token
const token = generateToken(user._id)
// send HTTP only cookie
res.cookie("token",token,{
  path:'/',
  httpOnly:true,
  expires: new Date(Date.now() + 1000 * 86400),
  sameSite: "none",
  secure: true
})

  if (user) {
    const { _id, name, email, imagearr } = user;
    res.status(201).json({
      _id,
      name,
      email,
      imagearr,
      token
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password, imagearr } = req.body;

  const newArr = []
  newArr.push(imagearr)
  if (!email || !password || !newArr) {
    res.status(400);
    throw new Error("Please fill in all fields");
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(401); // Unauthorized
    throw new Error("Invalid credentials");
  }
 
  if (newArr.length !== user.imagearr.length) {
    return res.status(400).json("Image array length mismatch");
  }
  
  // Compare imagearr elements
  const isImageArrayMatching = newArr.every(
    (image, index) => image === user.imagearr[index]
  );

  if (!isImageArrayMatching) {
    return res.status(400).json("Image array elements do not match");
  }
 // User exists, check if password is correct
 const passwordIsCorrect = await bcrypt.compare(password, user.password);
 // generate a token
 const token = generateToken(user._id);

 if(passwordIsCorrect){
   // Send HTTP-only cookie
   res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400), // 1 day
    sameSite: "none",
    secure: true,
  });
 }

  if (user && passwordIsCorrect &&isImageArrayMatching) {
    const { _id, name, email, imagearr } = user;

    res.status(200).json({
     _id,
     name,
     email,
     imagearr,
     token
    })
  }
});


const deleteUser = asyncHandler(async(req,res)=>{
    const deleteUser =  await User.deleteMany()
    if(deleteUser){
      return res.status(200).json(true)
    }
  })

  const  getUser =asyncHandler(async(req,res)=> {
    const user = await User.findById(req.user._id)
    if(user){
      const { _id, name, email} = user;
      res.status(200).json({
        _id,
        name,
        email,

      })
    } else{
      res.status(400)
      throw new Error("user not found")
    }
 })

 //  get login status
 const  loginStatus= asyncHandler(async(req,res)=>{
  const token = req.cookies.token
  if(!token){
    return res.json(false)
  }
   // verify token
   const verified = jwt.verify(token,process.env.JWT_SECRET)
   if(verified){
    return res.json(true)
   }
   return res.json(false)
 })

 const changePassword = asyncHandler(async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;

  if (!email || !currentPassword || !newPassword) {
    res.status(400);
    throw new Error("Please provide email, current password, and new password");
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Check if the current password is correct
  const passwordIsCorrect = await bcrypt.compare(currentPassword, user.password);

  if (!passwordIsCorrect) {
    res.status(401);
    throw new Error("Current password is incorrect");
  }

  // Hash and update the new password
  const salt = await bcrypt.genSalt(10);
  const hashedNewPassword = await bcrypt.hash(newPassword, salt);

  user.password = hashedNewPassword;
  await user.save();

  res.status(200).json({ message: "Password changed successfully" });
});


const changeImage =asyncHandler(async(req,res)=>{
  const {email,imagearr}= req.body
  if (!email || !imagearr) {
    res.status(400);
    throw new Error("Please provide a valid email and a new array of at least 3 images");
  }
  
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Update the user's imagearr
  user.imagearr = imagearr
  await user.save();

  res.status(200).json({ message: "Image array updated successfully" });
});


module.exports = {
    registerUser,
    deleteUser,
    loginUser,
    getUser,
    loginStatus,
    changePassword,
    changeImage
}