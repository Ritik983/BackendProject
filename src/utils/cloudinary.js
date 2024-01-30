import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDIANRY_CLOUD_NAME,
  api_key: process.env.CLOUDIANRY_API_KEY,
  api_secret: process.env.CLOUDIANRY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  if (!localFilePath) {
    console.log("localFilePath is falsy, returning null");
    return null;
  }
  try {
    // upload file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto',
    });
    //file has been uploaded successfully
     fs.unlinkSync(localFilePath)
    return response;
  } catch (error) {
    console.log("error");
     fs.unlinkSync(localFilePath) // remove the locally sved file
  }
};
export { uploadOnCloudinary };
