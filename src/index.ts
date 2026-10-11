import express from "express"
import jsonwebtoken from "jsonwebtoken"
import mongoose from "mongoose"
import {z} from "zod"
import bcrypt from "bcrypt"
import { UserModel } from "./db.js";

const app = express();
app.use(express.json())

app.post('/api/v1/signup', async (req, res) => {

    const requiredBody = z.object({
        userName: z.string().min(3).max(10),
        password: z.string().min(8).max(20)
    })

    const parsedData = requiredBody.safeParse(req.body)

    if(!parsedData.success){
        return res.status(411).json({
            message: "Invalid Input"
        })
    }

    const { userName, password } = parsedData.data


    try{

        const isuserExist = await UserModel.findOne({
            userName: userName
        })

        if(isuserExist){
            return res.status(403).json({
                message: "User aldready exists"
            })
        }
        
        const hashedPassword = await bcrypt.hash(password, 5)

        await UserModel.create({
            userName,
            password: hashedPassword
        })

        res.status(201).json({
            message: "User Created Successfully"
        })
    }catch(e){
        res.status(500).json({
            message: "Internal server error"
        })
    }

})

app.post('/api/v1/signin', async (req, res) => {
    const userName = req.body.userName
    const password = req.body.password

})

app.post('/api/v1/content', (req, res) => {

})

app.post('/api/v1/brain/share', (req, res) => {

})

app.post('/api/v1/brain/:shareLink', (req, res) => {

})

app.listen(3000, () =>{
    console.log("App running on port 3000")
})