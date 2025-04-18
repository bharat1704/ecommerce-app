const { ApiResponse } = require("../utils/ApiResponse");
const User = require("../models/user.model");
const { ApiError } = require("../utils/ApiError");
const { sendMail } = require("../service/mail.service");
const { BASE_URL } = require("../constants");
const crypto = require("crypto");
const { asyncHandler } = require("../utils/asyncHandler");
const jwt = require("jsonwebtoken");

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new Error(
      "Something went wrong while generating referesh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email) {
    return next(new ApiError(400, "Email is required"));
  }

  if (!password) {
    return next(new ApiError(400, "Password is required"));
  }

  const isUserAlreadyRegistered = await User.findOne({ email });

  if (isUserAlreadyRegistered) {
    return next(new ApiError(400, "User already registered"));
  }

  const user = await User.create({ email, password });
  // const createdUser = await User.findById(user._id).select("-password -refreshToken ")

  // return res.status(200).json(new ApiResponse(200,"User Rgistered Successfully", createdUser))
  return res
    .status(200)
    .json(new ApiResponse(200, "User Reistered Successfully"));
});

const loginUser = asyncHandler(async (req, res, next) => {
    console.log('Login attempt received:', req.body);
    const { email, password } = req.body;

    if (!email) {
      console.log('Login failed: Email missing');
      return next(new ApiError(400, "Email is required"));
    }

    if (!password) {
      console.log('Login failed: Password missing');
      return next(new ApiError(400, "Password is required"));
    }

    console.log('Looking for user with email:', email);
    const user = await User.findOne({ email });

    if (!user) {
      console.log('Login failed: User not found for email:', email);
      return next(new ApiError(401, "Invalid Credentials"));
    }

    console.log('User found, checking password...');
    const isPasswordCorrect = await user.isPasswordCorrect(password);
    console.log('Password check result:', isPasswordCorrect);

    if (!isPasswordCorrect) {
      console.log('Login failed: Incorrect password for user:', email);
      return next(new ApiError(401, "Invalid Credentials"));
    }

    console.log('Generating tokens for user:', user._id);
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id
    );
    console.log('Tokens generated successfully');

    const loggedInUser = await User.findById(user._id).select("role _id");
    console.log('User data retrieved:', { _id: loggedInUser._id, role: loggedInUser.role });
    const userData = {
      _id: loggedInUser._id,
      role: loggedInUser.role
    };

    console.log('Preparing to set cookies and send response');

    
    // Set cookie options based on environment
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
      domain: process.env.NODE_ENV === 'production' ? process.env.DOMAIN : 'localhost'
    };

    const finalResponse = {
      success: true,
      message: "User logged in successfully",
      data: userData
    };
    console.log('Sending login response:', finalResponse);

    return res
      .status(200)
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        path: "/",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: "Lax"
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: "Lax"
      })
      .cookie(
        "loggedInUserInfo",
        JSON.stringify(userData),
        {
          httpOnly: false,
          path: "/",
          secure: false,
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          sameSite: "Lax"
        }
      )
      .json(finalResponse);
});

const logoutUser = asyncHandler(async (req, res, next) => {
  const { id: userId } = req.body.user;

  const fetchedUser = await User.findById(userId);
  if (!fetchedUser) {
    return next(new ApiError(400, "User Not Found "));
  }

  fetchedUser.refreshToken = undefined;
  await fetchedUser.save();

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .clearCookie("loggedInUserInfo", options)
    .json(new ApiResponse(200, "Successfully Logged Out"));
});

const resetPasswordRequest = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ApiError(400, "Email is required"));
  }
  const fetchedUser = await User.findOne({ email });
  if (!fetchedUser) {
    return next(new ApiError(400, "User not found"));
  }

  const token = crypto.randomBytes(48).toString("hex");
  fetchedUser.resetPasswordToken = token;
  await fetchedUser.save();

  const subject = "Reset password Request";
  const resetPageLink = `${BASE_URL}/reset-password?token=${token}&email=${email}`;
  const html = `<p>Click <a href='${resetPageLink}'>here</a> to reset password</p>
                    <p>Donot share this mail/reset passwork link to anyone `;
  await sendMail({
    to: email,
    subject,
    text: "reset Password",
    html,
  });

  return res.status(200).json(new ApiResponse(200, "Mail sent successfully"));
});

const resetPassword = asyncHandler(async (req, res, next) => {
  const { password, email, token } = req.body;

  if (!password) {
    return next(new ApiError(400, "Password is required"));
  }
  if (!email) {
    return next(new ApiError(400, "Email is required"));
  }
  if (!token) {
    return next(new ApiError(400, "Token is required"));
  }

  const fetchedUser = await User.findOne({
    email: email,
    resetPasswordToken: token,
  });

  if (!fetchedUser) {
    return next(new ApiError(401, "Token in invalid or it has been expired"));
  }

  fetchedUser.password = password;
  fetchedUser.resetPasswordToken = null; // TODO : added this line but didn't test it
  await fetchedUser.save();

  const subject = "Password Reset Successfully ";
  const html = `<p>Your password has been successfully reset .</p>`;
  await sendMail({
    to: email,
    subject,
    text: "reset Password",
    html,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Password updated Successfully"));
});

module.exports = {
  generateAccessAndRefreshTokens,
  registerUser,
  loginUser,
  logoutUser,
  resetPasswordRequest,
  resetPassword,
};
