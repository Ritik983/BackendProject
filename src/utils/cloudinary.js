import {v2 as cloudinary} from 'cloudinary';
import fs from fs;
          
cloudinary.config({ 
  cloud_name:process.env.CLOUDIANRY_CLOUD_NAME, 
  api_key:process.env.CLOUDIANRY_API_KEY , 
  api_secret:process.env.CLOUDIANRY_API_SECRET
});

const uploadOnCloudinary = async(localFilePath) => {
  try {
if (!localFilePath) return null
  // upload file on cloudinary
 const response = await cloudinary.uploader.upload(localFilePath,
  { resource_type:auto });
  //file has been uploaded successfully 
  console.log("file has been uploaded successfully",response.url);
  return response
}
  catch (error){
    fs.unLinkSync(localFilePath) // remove the locally sved file
  }
}
export {uploadOnCloudinary};