import mongoose from "mongoose";

const { Schema } = mongoose;

const UserSchema = new Schema(
    {
        username: {
            type: String,
            default: ""
        },
        isAdmin: {
            type: Boolean,
            default: false
        },
        password: {
            type: String,
            required: true
        }
    },
    {
        _id: true, // keep ObjectId for each question
        timestamps: false
    }
)

export default mongoose.model("UserData", UserSchema, "Users");