import mongoose, {model, Schema} from "mongoose"

mongoose.connect("mongodb+srv://faizalmohamed5302002_db_user:tSTK9pYUnx7AbKjQ@cluster0.8j93ju7.mongodb.net/brainly")

const UserSchema = new Schema({
    userName : {type: String, unique: true},
    password : String
})

export const UserModel = model("User", UserSchema)

const ContentSchema = new Schema({
    title: String,
    link: String,
    tags: [{type: mongoose.Types.ObjectId, ref: 'Tag'}],
    userId: {type: mongoose.Types.ObjectId, ref: 'User', required: true}
})

export const ContentModel = model("Content", ContentSchema);

const LinkSchema = new Schema({
    hash: {type: String, required: true, unique: true},
    userId: {type: mongoose.Schema.Types.ObjectId, required: true, ref: "User", unique: true}
})

export const LinkModel = model("Links", LinkSchema)