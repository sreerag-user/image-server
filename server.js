const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const cors = require('cors')
const cron = require('node-cron')
const axios = require('axios')

const app = express()
const port = 3000

cron.schedule("*/10 * * * *", async () => {
    try{
        await axios.get("https://image-server-y1up.onrender.com/");
        console.log("----Self Ping----");
    }catch(err){
        console.log("error: ", err)
    }
})

const uploadDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir)

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
})

const upload = multer({ storage })

app.use('/uploads', express.static(uploadDir))
app.use(cors())

app.get("/", (req, res) => {
    res.json("API Working");
})

app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  res.json({ message: 'Upload successful', filePath: `/uploads/${req.file.filename}` })
})

app.get('/images', (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).json({ error: 'Failed to read uploads folder' })
    const imageUrls = files.map(file => `${req.protocol}://${req.get('host')}/uploads/${file}`)
    res.json({ images: imageUrls })
  })
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
