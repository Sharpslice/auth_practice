const path = require("node:path")
const {Pool} = require("pg");
const express = require("express");
const session = require('express-session');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;

const pool = new Pool({
    user: process.env.DB_USER,
    host: 'localhost',
    username: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432
})

const app = express();
app.set('views',path.join(__dirname),'views')
app.set('view engine','ejs');

app.use(session({secret: 'cats',resave:false,saveUninitialized:false}));
app.use(passport.session());
app.use(express.urlencoded({extended:false}))

app.get('/',(req,res)=>{
    res.render('index')
})