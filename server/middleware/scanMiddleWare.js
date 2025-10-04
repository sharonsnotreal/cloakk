const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");
const { fileTypeFromBuffer } = require("file-type");

const allowedMimeTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "image/jpeg",
  "image/png",
  "video/mp4",
  "video/quicktime",
  "video/x-msvideo",
];

const scanAndUpload = async (req, res, next) => {


  try {

      if (!req.file) {
    return next();
    }

const buffer = req.file.buffer;
    // 1. Validate True File Type (remains the same)
    const type = await fileTypeFromBuffer(buffer);
    if (!type || !allowedMimeTypes.includes(type.mime)) {
      return res.status(400).json({ message: "Invalid file type." });
    }

    // 2. Scan the file using Cloudmersive API (remains the same)
    const formData = new FormData();
    formData.append("file", buffer, req.file.originalname);
    const scanResponse = await axios.post(
      "https://testapi.cloudmersive.com/virus/scan/file",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Apikey: process.env.CLOUDMERSIVE_API_KEY,
        },
      }
    );

    if (!scanResponse.data.CleanResult) {
      console.error(
        `Malware detected: ${scanResponse.data.FoundViruses.map(
          (v) => v.VirusName
        ).join(", ")}`
      );
      return res
        .status(400)
        .json({ message: "Malicious file detected and rejected." });
    }

    // 3. If clean, save the file to the local disk instead
    const uploadsDir = path.join(__dirname, "..", "uploads");

    // Create the 'uploads' directory if it doesn't exist
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const uniqueFilename = `${Date.now()}-${req.file.originalname}`;
    const filePath = path.join(uploadsDir, uniqueFilename);
    

    // Write the file from buffer to the disk
    fs.writeFileSync(filePath, buffer);

    // Attach the public-facing path to the request object for the controller
    // This will be used to construct the URL to access the file
    req.file.path = `/uploads/${uniqueFilename}`;
    next();
  } catch (err) {
    console.error(
      "Error during file scan or save process:",
      err.response ? err.response.data : err.message
    );
    return res.status(500).json({ message: "Error processing file." });
  }
};

module.exports = { scanAndUpload };
