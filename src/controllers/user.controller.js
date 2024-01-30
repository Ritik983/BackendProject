import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";

const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await user.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
  } catch (err) {
    throw new apiError(
      500,
      "something went wrong while generating referesh access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, fullname, password } = req.body;

  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new apiError(400, "All fields are required");
  }
  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existingUser) {
    throw new apiError(409, "user with email and userName already exists");
  }
  const avatarLocalPath = await req.files?.avatar[0]?.path;
  const coverImagelocalPath = await req.files?.coverImage[0]?.path;
  console.log("local file", avatarLocalPath);
  if (!avatarLocalPath) {
    throw new apiError(400, "avatar file is required");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImagelocalPath);
  if (!avatar) {
    throw new apiError(400, "avatar file is required");
  }
  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });
  const createUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createUser) {
    throw new apiError(500, "something went wrong.while registering user");
  }
  return res
    .status(201)
    .json(new apiResponse(200, createUser, "user Register successfully"));
});
const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  if (!username || !email) {
    throw new apiError(400, "username or password is required");
  }
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (!user) {
    throw new apiError(400, "user does not exists");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new apiError(401, "Invalid user credentials");
  }
  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user_id);
    const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const option = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(
      new apiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "user logged in successfully"
      )
    );
});
const logoutUser = asyncHandler(async(req,res)=>{
  User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
        refreshToken:undefined
      }
    },
    {
      new:true  
    }
  )
  const option =  {
    httpOnly:true,
    secure:true
  }
  return res.status(200)
  .clearCookie("accessToken",option)
  .clearCookie("refreshToken",option)
  .json(new apiResponse(200,{},"user logout succesfully"))
})

export { registerUser, loginUser,logoutUser };
