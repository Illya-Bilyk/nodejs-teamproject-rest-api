const cloudinary = require("cloudinary").v2;

const deletePhoto = async (file, id) => {
  cloudinary.v2.api
    .delete_resources([`${file}/${id}`], {
      type: "upload",
      resource_type: "image",
    })
    .then((result) => result);
};

module.exports = deletePhoto;
