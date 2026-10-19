import type { NextFunction, Request, Response } from "express";
import jwt, { decode } from "jsonwebtoken";
import { JWT_USER_SECRET } from "./config.js";


export const userMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers["authorization"];
    const decoded = jwt.verify(header as string, JWT_USER_SECRET)
    if ( decoded ){
        //@ts-ignore
        req.userId = decode.id
        next()
    } else {
        res.status(403).json({
            message: "You are not logged in"
        })
    }
}