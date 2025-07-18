const path = require("node:path")
const {Pool} = require("pg");
const express = require("express");
const session = require('express-session');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs')
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
    res.render('index', {user:req.user})
})
app.get('/sign-up',(req,res)=>{
    res.render('sign-up-form')
})
app.post('/sign-up',async(req,res,next)=>{
    const {username,password} = req.body
    const hashedPassword = await bcrypt.hash(password,10)
    try{
        await pool.query(`
            INSERT INTO users (username,password) 
            VALUES ($1,$2)
        `,[username,hashedPassword]);
        res.redirect('/')

    }catch(err){
        return next(err)
    }
    
})
app.get('/log-in',(req,res)=>{
    console.log('switching to log-in page')
    res.render('log-in-form')
})
app.get('/log-out',(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        res.redirect('/')
    })
})
app.post('/log-in',passport.authenticate("local",{successRedirect:"/",failureRedirect:"/"}))

passport.use(new localStrategy(async(username,password,done)=>{
    try{
        const {rows} = await pool.query(`
            SELECT * FROM users
            WHERE username = $1 
        `,[username])
        const user = rows[0];
        if(!user){
            return done(null,false,{message: 'Incorrect Username'})
        }
        const match = await bcrypt.compare(user.password,password)
        if(match){
            return done(null,false,{message: 'Incorrect Password'});
        }
        return done(null,user)
    }catch(err){
        return done(err)
    }


}));

passport.serializeUser((user,done)=>{
    done(null,user.id)
})

passport.deserializeUser(async(id,done)=>{
    try{
        const {rows} = await pool.query(`
            SELECT * from users WHERE id = $1
        `,[id])
        const user = rows[0];
        done(null,user);
    }catch(err){
        done(err)
    }
})

app.listen(3000,()=> console.log("app listening on port 3000!"))