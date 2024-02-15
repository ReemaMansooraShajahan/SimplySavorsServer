import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import settingsRouter from './routes/settings.js'
import { userRouter } from './routes/users.js'
import { recipesRouter } from './routes/recipes.js'
import favoritesRouter from './routes/favorites.js'
const app=express()
app.use(express.json())
app.use(cors())
app.use("/auth", userRouter)
app.use("/recipes", recipesRouter)
app.use("/favorites", favoritesRouter); 
app.use('/settings', settingsRouter);
mongoose.connect('mongodb+srv://Reema:MERNpassword123@recipes.8wj3ngl.mongodb.net/recipes?retryWrites=true&w=majority')
app.listen(3009,()=> console.log("SERVER STARTED"))