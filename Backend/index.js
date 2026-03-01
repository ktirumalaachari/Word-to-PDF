const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const libre = require("libreoffice-convert");

const app = express();

//  Render requires this
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Ensure folders exist
const uploadDir = path.join(__dirname, "uploads");
const filesDir = path.join(__dirname, "files");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

if (!fs.existsSync(filesDir)) {
    fs.mkdirSync(filesDir);
}

// storage setup
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

// Test route
app.get("/", (req, res) => {
    res.send("Word to PDF Backend is running successfully");
});

// Convert route
app.post("/convertFile", upload.single("file"), (req, res) => {

    if (!req.file) {
        return res.status(400).json({
            message: "No file uploaded",
        });
    }

    const inputPath = req.file.path;

    const outputPath = path.join(
        filesDir,
        path.parse(req.file.filename).name + ".pdf"
    );

    const file = fs.readFileSync(inputPath);

    libre.convert(file, ".pdf", undefined, (err, done) => {

        if (err) {
            console.log(err);
            return res.status(500).json({
                message: "Conversion failed",
            });
        }

        fs.writeFileSync(outputPath, done);

        res.download(outputPath, () => {

            fs.unlinkSync(inputPath);
            fs.unlinkSync(outputPath);

        });

    });

});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
