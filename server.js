const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

require('dotenv').config()

const PORT = process.env.PORT;

//require routes
const provaRoutes = require('./routes/prova')
const artistsRoutes = require('./routes/artists')
const localRoutes = require('./routes/locals')
const loginRoutes = require('./routes/login')
const eventRoutes = require('./routes/events')
const reviewRoutes = require('./routes/reviews')

const app = express();

//middleware
app.use(express.json())
app.use(cors())
//use routes
app.use('/', provaRoutes)
app.use('/', artistsRoutes)
app.use('/', localRoutes)
app.use('/', loginRoutes)
app.use('/', eventRoutes)
app.use('/', reviewRoutes)
mongoose.connect(process.env.MONGO_URL)

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Errore di connessione al server!'))
db.once('open', () => console.log('Database MongoDB connesso!'))

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`))