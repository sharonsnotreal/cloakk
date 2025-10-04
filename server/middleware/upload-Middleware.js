const multer = require("multer");
const path = require("path");
const { fileTypeFromBuffer } = require("file-type");




const storage = multer.memoryStorage();

const allowedMimeTypes = [
  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "text/plain",
  // Images
  "image/jpeg",
  "image/png",
  // Videos
  "video/mp4",
  "video/quicktime", // .mov
  "video/x-msvideo", // .avi
];

// // const storage = multer.diskStorage({
// //   destination: function (req, file, cb) {
// //     cb(null, "uploads/");
// //   },
// //   filename: function (req, file, cb) {
// //     cb(null, `${Date.now()}-${file.originalname}`);
// //   },
// // });
// const storage = multer.memoryStorage();
// const fileFilter = async (req, file, cb) => {
//   const buffer = file.buffer;
//   const type = await fileTypeFromBuffer(buffer);

//   if (!type || !allowedMimeTypes.includes(type.mime)) {
//     return cb(
//       new Error(
//         "Invalid file type. Only Documents, Images, and videos are allowes"
//       ),
//       false
//     );
//   } else {
//     cb(null, true);
//   }
// };
// const upload = multer({
//   storage,
//   limits: {
//     fileSize: 1024 * 1024 * 50, // 50MB limit for videos/large files
//   },
//   fileFilter,
// });

// module.exports = upload;



const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 50, // 50MB
  },
  // no fileFilter here — validate in route
});

// module.exports = upload;

const fileCheck =  async (req, res, next) => {
  try {
    const { file } = req;
    if (!file || !file.buffer) return res.status(400).send('No file uploaded');

    const type = await fileTypeFromBuffer(file.buffer);
    if (!type || !allowedMimeTypes.includes(type.mime)) {
      return res.status(400).send('Invalid file type');
    }

    // proceed to save file.buffer to disk/cloud, etc.
    res.status(200).send('OK');
  } catch (err) {
    next(err);
  }
}

// module.exports = fileCheck;

module.exports = { upload, fileCheck };