const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
require("dotenv").config();
const ShortUniqueId = require("short-unique-id");
const uid = new ShortUniqueId();
const { HttpError } = require("../utils");

const { CLOUDINARY_NAME, CLOUDINARY_KEY, CLOUDINARY_SECRET } = process.env;

cloudinary.config({
  cloud_name: CLOUDINARY_NAME,
  api_key: CLOUDINARY_KEY,
  api_secret: CLOUDINARY_SECRET,
  secure: true,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    if (!file) {
      throw HttpError(401, "File is missing");
    } // якщо немає файлу - повідомлення про помилку

    const filename = `${req.user.id}-${uid.rnd(21)}`; // генеруємо нову назву файлу

    const fileData = { ...file, originalname: filename }; // змінюємо назву файлу

    let folder;
    if (fileData.fieldname === "avatar") {
      folder = "avatars"; // якщо папка призначення в маршруті upload() avatars то ...
    } else if (fileData.fieldname === "cocktail") {
      folder = "cocktails"; // якщо папка призначення в маршруті upload() cocktails то ...
    } else {
      folder = "others";
    }
    return {
      folder: folder, // назва папки на cloudinary
      allowed_formats: ["jpeg", "jpg", "png"], // дозволений формат файлу
      public_id: fileData.originalname, // назва файлу в папці на cloudinary
      transformation: [
        { width: 350, height: 350 },
        { width: 700, height: 700 },
      ], // перетворення файлу
    };
  },
});

const upload = multer({ storage });

module.exports = upload;
