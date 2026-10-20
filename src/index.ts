import express from "express"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import {z} from "zod"
import bcrypt from "bcrypt"
import { ContentModel, LinkModel, UserModel } from "./db.js";
import { JWT_USER_SECRET } from "./config.js";
import { userMiddleware } from "./middleware.js";
import crypto from "crypto"

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

    const requiredBody = z.object({
        userName: z.string().min(3).max(10),
        password: z.string().min(8).max(20)
    })

    const parsedData = requiredBody.safeParse(req.body)
    
    if(!parsedData.success){
        return res.status(403).json({
            message: "Invalid input"
        })
    }

    const { userName, password } = parsedData.data

    const user = await UserModel.findOne({
        userName: userName
    })

    if (!user || !user.password) {
        return res.status(401).json({
            message: "Invalid credentials"
        });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if(isPasswordValid){
        res.status(200).json({
            token: jwt.sign({id: user._id}, JWT_USER_SECRET)
        })
    }else{
        res.status(403).json({
            message: "Invalid credentials"
        })
    }

})

app.post('/api/v1/content', userMiddleware, async (req, res) => {
    const link = req.body.link;
    const title = req.body.title;

    await ContentModel.create({
        link,
        title,
        //@ts-ignore
        userId : req.userId,
        tags: []
    })

    res.json({
        message: "Content added successfully"
    })
})

app.get('/api/v1/content', userMiddleware, async (req, res) => {
    //@ts-ignore
    const userId = req.userId;
    const content = await ContentModel.find({
        userId : userId
    }).populate("userId", "userName")

    res.json({
        content
    })
})

app.delete('/api/v1/content', userMiddleware, async (req, res) => {
    const contentId = req.body.contentId;

    await ContentModel.deleteMany({
        _id: contentId,
        //@ts-ignore
        userId: req.userId
    })
    res.json({
        message: "Items deleted successfully"
    })
})

app.post('/api/v1/brain/share', userMiddleware,async (req, res) => {
    const share = req.body.share;
    //@ts-ignore
    const userId = req.userId;

    try{
        if(share){
            const existing =  await LinkModel.findOne({ userId })
            if(existing){
                return res.json({
                    hash: existing.hash
                })
            }

            const hash = crypto.randomBytes(16).toString("hex")
            await LinkModel.create({
                userId,
                hash
            })
            return res.status(200).json({
                hash
            })
        }

        await LinkModel.deleteOne({userId})
        res.json({
            message: "sharing disabled"
        })
    }catch(e) {
        res.status(500).json({message: "Internal server error"})
    }
})

app.get('/api/v1/brain/:shareLink', async (req, res) => {

    try{

        const link = await LinkModel.findOne({ hash: req.params.shareLink});
    
        if(!link){
            return res.status(404).json({ message: "Invalid Input"})
        }
    
        const [content, user]= await Promise.all([
            ContentModel.find({ userId: link.userId}).select("title link tags"),
            UserModel.find({userId: link.userId}).select("userName")
        ])
    
        res.json({
            userName: user?.userName,
            content
        })
    }catch(e){
        res.status(500).json({ message: "Internal server error"})
    }

})

app.listen(3000, () =>{
    console.log("App running on port 3000")
})