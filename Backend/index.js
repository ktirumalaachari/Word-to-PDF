const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const libre = require("libreoffice-convert");

const app = express();

// Railway / Render dynamic port
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Ensure folders exist
const uploadDir = path.join(__dirname, "uploads");
const filesDir = path.join(__dirname, "files");

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
if (!fs.existsSync(filesDir)) fs.mkdirSync(filesDir);

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

// Test route
app.get("/", (req, res) => {
  res.send("✅ Word to PDF Backend is running successfully");
});

// Convert route
app.post("/convertFile", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const inputPath = req.file.path;
    const outputPath = path.join(
      filesDir,
      path.parse(req.file.filename).name + ".pdf"
    );

    const file = fs.readFileSync(inputPath);

    libre.convert(file, ".pdf", undefined, (err, done) => {
      if (err) {
        console.error("Conversion error:", err);
        return res.status(500).json({ message: "Conversion failed" });
      }

      fs.writeFileSync(outputPath, done);

      res.download(outputPath, () => {
        // cleanup files
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      });
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
