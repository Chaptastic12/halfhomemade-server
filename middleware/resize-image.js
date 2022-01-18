const sharp = require("sharp");

const resizeImage = async(image) => {
    const imagePath = image.path.replace(/\\/g, '/');
    const savePath = 'webp' + image.filename;

    console.log(savePath)
  try {
    await sharp(imagePath)
      .resize({
        width: 950,
        height: 650
      })
      .toFormat("webp")
      .toFile('./uploads/images/' + savePath);
  } catch (error) {
    console.log(error);
  }
}

module.exports = resizeImage;