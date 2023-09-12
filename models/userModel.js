const mongoose = require('mongoose')

const userSchema = mongoose.Schema(
    {
        name: {
          type: String,
          required: [true, "Please add a name"],
        },
        email: {
          type: String,
          required: [true, "Please add a email"],
          unique: true,
          trim: true,
          match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Please enter a valid emaial",
          ],
        },
        password: {
          type: String,
          required: [true, "Please add a password"],
          minLength: [4, "Password must be up to 6 characters"],
          //   maxLength: [23, "Password must not be more than 23 characters"],
        },
        imagearr:{
            type:Array,
            required: [true, "Please  select an image"],
        }
},  {
    timestamps: true,
  }
)

module.exports = mongoose.model('User', userSchema)