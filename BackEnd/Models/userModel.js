import mongoose from "mongoose"

const {Schema} = mongoose

const userSchema = new Schema({
    username:{
        type: String,
        required: true,
        unique: true
    },
    fullname:{
        type: String,
        default:"",
    },
    password:{
        type: String,
        minLength: 6
    },
    email:{
        type: String,
        required: true,
    }
},{timestamps: true});

const User = mongoose.model("User", userSchema)
export default User