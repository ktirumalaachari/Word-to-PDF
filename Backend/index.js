const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const libre = require("libreoffice-convert");

const app = express();
const port = 3000;

app.use(cors());

// storage setup
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

// convert route
app.post("/convertFile", upload.single("file"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "No file uploaded",
            });
        }

        const inputPath = req.file.path;

        const outputPath = path.join(
            __dirname,
            "files",
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
                console.log("File downloaded");

                fs.unlinkSync(inputPath);
                fs.unlinkSync(outputPath);
            });
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});