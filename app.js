const path = require("node:path")
const {Pool} = require("pg");
const express = require("express");
const session = require('express-session');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
require('dotenv').config()
const pool = new Pool({
    user: process.env.DB_USER,
    host: 'localhost',
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432
})

const app = express();
app.set('views',path.join(__dirname,'views'))
app.set('view engine','ejs');

app.use(session({secret: 'cats',resave:false,saveUninitialized:false}));
app.use(passport.session());
app.use(express.urlencoded({extended:false}))

app.get('/',(req,res)=>{
    res.render('index')
})
app.get('/sign-up',(req,res)=>{
    res.render('sign-up-form')
})
app.post('/sign-up',async(req,res,next)=>{
    const {username,password} = req.body
    try{
        await pool.query(`
            INSERT INTO users (username,password) 
            VALUES ($1,$2)
        `,[username,password]);
        res.redirect('/')

    }catch(err){
        return next(err)
    }
    
})

app.listen(3000,()=> console.log("app listening on port 3000!"))