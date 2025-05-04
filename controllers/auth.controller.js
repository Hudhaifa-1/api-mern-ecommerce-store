import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import redis from "../lib/redis.js";

const generateAccessToken = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });

  return { accessToken };
};

const generateRefreshToken = (userId) => {
  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  return { refreshToken };
};

const storeRefreshToken = async (userId, refreshToken) => {
  await redis.set(
    `refresh_token:${userId}`,
    refreshToken,
    "EX",
    7 * 24 * 60 * 60
  ); // 7 days
};

const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true, // prevents xss (cross-site scripting) attacks
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", // prevents CSRF (cross-site request forgery) attacks
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  if (refreshToken) {
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
};

export const signup = async (req, res) => {

  if (Object.keys(await req.body).length === 0) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields." }); // When the user does not provide any data.
  }

  let { email, password, name, phone, address } = await req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists." });
    }

    if(! testPhoneNumber(phone)){
      return res.status(400).json({ message: "Invalid phone number." });
    }

    if(!phone.toString().startsWith("0")){
      phone = 0 + phone
    }
    

    const user = await User.create({ email, password, name, phone, address });

    // Authenticate
    const { accessToken } = generateAccessToken(user._id);
    const { refreshToken } = generateRefreshToken(user._id);
    await storeRefreshToken(user._id, refreshToken); // Store the refresh token in Redis

    setCookies(res, accessToken, refreshToken);

    res.status(200).json({
      message: "User created successfully.",
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        address: user.address,
        email: user.email,
        role: user.role,
      },
      accessToken
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = await req.body;

    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const { accessToken } = generateAccessToken(user._id);
    const { refreshToken } = generateRefreshToken(user._id);
    storeRefreshToken(user._id, refreshToken);
    setCookies(res, accessToken, refreshToken);

    res.status(200).json({
      message: "Logged in successfully.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    redis.del(`refresh_token:${decoded.userId}`); // Delete the refresh token from Redis
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.status(200).json({ message: "Logged out successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// This function will be used to refresh the access token using the refresh token
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided." });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const storedRefreshToken = await redis.get(
      `refresh_token:${decoded.userId}`
    );

    if (storedRefreshToken !== refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token." });
    }

    const { accessToken } = generateAccessToken(decoded.userId);
    setCookies(res, accessToken, null);

    res.status(200).json({
      message: "Access token refreshed successfully.",
      accessToken
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    console.log(req.user);

    res.json(req.user);
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "Server error", error: error.message });
  }
};

function testPhoneNumber(phone) {
  const regex = /^(77|077|88|078|75|075|79|079)\d{7,8}$/;
  return regex.test(phone);
}
