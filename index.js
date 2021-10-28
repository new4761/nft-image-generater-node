const fs = require("fs");
const path = require("path");
const mergeImages = require("merge-images");
const JSZip = require("JSZip")
const imageFolderPath = path.join(__dirname, "image");
const { Canvas, Image } = require('canvas');


const readImageForDirectory = () => {
  let ATTRIBUTE_MAP = {};
  const folder = fs.readdirSync(imageFolderPath);
  folder.forEach((subfolder) => {
    const files = fs.readdirSync(path.join(imageFolderPath, subfolder));
    ATTRIBUTE_MAP[subfolder] = files;
  });
  return ATTRIBUTE_MAP;
};

const addImage = async (imageObject) => {
  const image = [];
  Object.keys(imageObject).forEach((part) => {
    if (imageObject[part] !== "none" && imageObject[part] !== "") {
      image.push(
        path.join(imageFolderPath,part,imageObject[part])
      );
    }
  });

  return mergeImages(image, {
    Canvas: Canvas,
    Image: Image
  }).then((base64String) => base64String);
};

const exportImageList = (imageList) => {
  var zip = new JSZip();
  imageList.forEach((dataURL, index) => {
    var base64String = dataURL.replace("data:image/png;base64,", "");
    zip.file(`${index}.png`, base64String, { base64: true });
  });
zip
.generateNodeStream({type:'nodebuffer',streamFiles:true})
.pipe(fs.createWriteStream('images.zip')).on('finish', function () {
  // JSZip generates a readable stream with a "end" event,
  // but is piped here in a writable stream which emits a "finish" event.
  console.log("images.zip written.");
});
};


//to learn 
function getCartesian(object) {
  return Object.entries(object).reduce(
    (root, [key, value]) => {
      var temp = [];
      root.forEach((s) => {
        return (Array.isArray(value) ? value : [value]).forEach((w) =>{
          (w && typeof w === "object" ? getCartesian(w) : [w]).forEach(
            (x) => {
              return temp.push(Object.assign({}, s, { [key]: x }));
              
            }
          )
        }
        );
      });
      return temp;
    },
    [{}]
  );
}


const createImageList =async () =>{
  let imageList = []
  const ATTRIBUTE_MAP =readImageForDirectory();
  const cartesian = getCartesian(ATTRIBUTE_MAP)
  await Promise.all(cartesian.map(async (imageObject) => {
    await addImage(imageObject).then(b64=>{imageList.push(b64)})
  }));
  return imageList;
}


const generateImageZip = async () =>{
  const imageList =await createImageList()
  await exportImageList(imageList) 
}


generateImageZip()
