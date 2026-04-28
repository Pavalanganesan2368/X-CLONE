import Notification from "../model/notifications.model.js";
import User from "../model/User.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "cloudinary";

export const getProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });

    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in Get Profile : " + error.message);
    res.status(500).json({
      error: "Internet Server Error",
    });
  }
};

export const followUnfollow = async (req, res) => {
  try {
    const { id } = req.params;
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

    if (id === req.user._id)
      return res
        .status(404)
        .json({ error: "You Can't unfollow/follow yourself." });
    if (!userToModify || !currentUser)
      return res.status(404).json({ error: "User not found" });

    const isFollowing = currentUser.following.includes(id);
    if (isFollowing) {
      await User.findByIdAndUpdate(
        { _id: id },
        { $pull: { followers: req.user._id } },
      );
      await User.findByIdAndUpdate(
        { _id: req.user._id },
        { $pull: { following: id } },
      );
      res.status(200).json({ message: "Unfollow Successfully." });
    } else {
      await User.findByIdAndUpdate(
        { _id: id },
        { $push: { followers: req.user._id } },
      );
      await User.findByIdAndUpdate(
        { _id: req.user._id },
        { $push: { following: id } },
      );

      const newNotification = new Notification({
        type: "follow",
        from: req.user._id,
        to: userToModify._id,
      });

      await newNotification.save();
      res.status(200).json({ message: "Follow Successfully." });
    }
  } catch (error) {
    console.log("Error in follow and unfollow controller : " + error.message);
    res.status(500).json({
      error: "Internet Server Error",
    });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id;
    const userFollowedByMe = await User.findById(userId).select(
      "-password",
    );

    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      {
        $sample: {
          size: 10,
        },
      },
    ]);

    const filteredUser = users.filter(
      (user) => !userFollowedByMe.following.includes(user._id),
    );
    const suggestedUsers = filteredUser.slice(0, 4);

    suggestedUsers.forEach((user) => (user.password = null));

    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.log("Error in Get Suggested Controller : " + error.message);
    res.status(500).json({
      error: "Internet Server Error",
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      username,
      fullName,
      email,
      currentPassword,
      newPassword,
      bio,
      link,
    } = req.body;

    let { profileImg, coverImg } = req.body;

    let user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if ((!newPassword && currentPassword) || (!currentPassword && newPassword))
      return res.status(404).json({
        error: "Please provide both new password and current password.",
      });
    if (currentPassword && newPassword) {
      if (newPassword.length < 6) {
        return res.status(404).json({
          error: "Password must have at least 6 characters",
        });
    }

      const isMatch = await bcrypt.compare(currentPassword, user.password);

      if (!isMatch) {
        return res.status(404).json({
          error: "Current password is incorrect",
        });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    if (profileImg) {
        if (user.profileImg) await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
        const uploadedResponse = await cloudinary.uploader.upload(profileImg);
        profileImg = uploadedResponse.secure_url;
    }

    if (coverImg) {
        if (user.coverImg) await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
        const uploadedResponse = await cloudinary.uploader.upload(coverImg);
        coverImg = uploadedResponse.secure_url;
    }

    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;

    user = await user.save();
    user.password = null;
    return res.status(200).json(user);
  } catch (error) {
    console.log("Error in updateUser Controller : " + error.message);
    res.status(500).json({
      error: "Internet Server Error",
    });
  }
};
