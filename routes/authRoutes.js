const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.COMPANY_EMAIL,
    pass: process.env.COMPANY_PASSWORD,
  },
});

router.get('/', (req, res) => {
  res.json({
    message: 'User Route is working',
  });
});

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email, password });
    await user.save();
    res.json({
      message: 'User created successfully',
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: 'User not found',
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: 'Invalid Credentials',
      });
    }
    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET_KEY
    );
    res.json({
      token,
      user,
      message: 'User logged in successfully',
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

router.post('/sendotp', async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000);
  try {
    const mailOptions = {
      from: process.env.COMPANY_EMAIL,
      to: email,
      subject: 'OTP for verification',
      text: `Your OTP for verification is ${otp}`,
    };
    transporter.sendMail(mailOptions, async (err, info) => {
      if (err) {
        console.log(err);
        res.status(500).json({
          message: err.message,
        });
      } else {
        const user = await User.findOne({ email });
        if (!user) {
          return res.status(400).json({
            message: 'User not found',
          });
        }

        user.otp = otp;
        await user.save();

        res.json({
          message: 'OTP sent successfully',
        });
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: err.message,
    });
  }
});

router.post('/changepassword', async (req, res) => {
  const { email, otp, newpassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: 'User not found',
      });
    }
    if (user.otp != otp) {
      return res.status(400).json({
        message: 'Invalid OTP',
      });
    }

    user.password = newpassword;
    user.otp = null;
    await user.save();

    res.json({
      message: 'Password changed successfully',
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});
module.exports = router;
