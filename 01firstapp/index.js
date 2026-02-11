require('dotenv').config()
const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/X', (req,res) => {
    res.send("tejasX.com")
})

app.get('/login', (req,res) => {
    res.send("<h1>Login at my App</h1>")
})

app.get('/youtube' , (req,res) => {
    res.send('<h2><a href="https://youtu.be/pOV4EjUtl70?si=YGrU5aRdA2LUND3C">Clink on the link</a></h2>')
})

app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${port}`)
})

//Runnig on localhost:4000
