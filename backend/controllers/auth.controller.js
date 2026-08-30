import User from "../model/User.model.js";
import bcrypt from "bcryptjs";
import generateToken from "../utilis/generateToken.js";

export const signup = async (req, res) => {
  try {
    const { username, fullName, email, password } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Invalid Email Format",
      });
    }
    const existingEmail = await User.findOne({ email });
    const existingUserName = await User.findOne({ username });

    if (existingEmail || existingUserName) {
      return res.status(400).json({
        error: "Already Existing User or Email",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password Must Have atleast 6 character length",
      });
    }

    // Hashing the password

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      await newUser.save();
      generateToken(newUser._id, res);

      res.status(200).json({
        _id: newUser._id,
        username: newUser.username,
        fullName: newUser.fullName,
        email: newUser.email,
        followers: newUser.followers,
        following: newUser.following,
        profileImg: newUser.profileImg,
        coverImg: newUser.coverImg,
        bio: newUser.bio,
        link: newUser.link,
      });
    } else {
      res.status(400).json({
        error: "Invalid User Data",
      });
    }
  } catch (error) {
    console.log("Error in Signup Controller : " + error.message);
    res.status(500).json({
      error: "Internet Server Error",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || "",
    );

    if (!user || !isPasswordCorrect) return res.status(400).json({ error: "Invalid username or Password." });
    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      followers: user.followers,
      following: user.following,
      profileImg: user.profileImg,
      coverImg: user.coverImg,
      bio: user.bio,
      link: user.link,
    });

  } catch (error) {
    console.log("Error in Login Controller : " + error);
    res.status(500).json({
      error: "Internet Server Error",
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", {
        maxAge : 0
    });

    res.status(200).json({
        message : "Logout Successfully!"
    })
  } catch (error) {
    console.log(`Error in Logout Controller : ${error.message}`);
    res.status(500).json({
      error: "Internet Server Error",
    });
  }
};

export const getMe = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json(null);
        const user = await User.findOne({ _id : req.user._id }).select("-password");

        if (!user) return res.status(401).json({ error : "Unauthorized" });

        res.status(200).json(user);
    } catch (error) {
        console.log(`Error in getMe Controller : ${error.message}`);
        res.status(500).json({
            error : "Internet Server Error"
        });
    }
}