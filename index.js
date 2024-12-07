const express = require("express");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const tf = require("@tensorflow/tfjs-node");

const app = express();
const port = 8080;

// Middleware untuk memproses file upload
const upload = multer({
  limits: { fileSize: 1000000 }, // Batas file 1MB
  fileFilter(req, file, cb) {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("File harus berupa gambar."));
    }
    cb(null, true);
  },
});

// Route root untuk memberikan informasi ke user
app.get("/", (req, res) => {
  res.status(200).send("Welcome to the Machine Learning API! Use /predict to send your requests.");
});

// Simulasikan model TensorFlow
async function predictImage(imageBuffer) {
  // Simulasi prediksi
  const randomProbability = Math.random(); // Simulasikan probabilitas [0-1]
  return randomProbability > 0.5 ? "Cancer" : "Non-cancer";
}

// Endpoint untuk prediksi
app.post("/predict", upload.single("image"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        status: "fail",
        message: "File tidak ditemukan atau format salah.",
      });
    }

    const id = uuidv4();
    const createdAt = new Date().toISOString();
    const result = await predictImage(file.buffer); // Panggil model prediksi

    const response = {
      id,
      result,
      suggestion:
        result === "Cancer"
          ? "Segera periksa ke dokter!"
          : "Penyakit kanker tidak terdeteksi.",
      createdAt,
    };

    res.status(200).json({
      status: "success",
      message: "Model is predicted successfully",
      data: response,
    });
  } catch (error) {
    if (error.message.includes("File terlalu besar")) {
      return res.status(413).json({
        status: "fail",
        message: "Payload content length greater than maximum allowed: 1000000",
      });
    }
    res.status(400).json({
      status: "fail",
      message: "Terjadi kesalahan dalam melakukan prediksi",
    });
  }
});

// Jalankan server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
