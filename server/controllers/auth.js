const bcrypt = require("bcrypt")
const User = require("../models/User")
const OTP = require("../models/OTP")
const jwt = require("jsonwebtoken")
const otpGenerator = require("otp-generator")
require("dotenv").config()



exports.sendotp = async (req, res) => {
  try {
    const { email } = req.body

    const checkUserPresent = await User.findOne({ email })

    if (checkUserPresent) {

      return res.status(401).json({
        success: false,
        message: `User is Already Registered`,
      })
    }

    var otp = otpGenerator.generate(5, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    })
    const result = await OTP.findOne({ otp: otp })

    while (result) {
      otp = otpGenerator.generate(5, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      })
    }
    const otpPayload = { email, otp }
    const otpBody = await OTP.create(otpPayload)
    console.log("OTP Body", otpBody)
    res.status(200).json({
      success: true,
      message: `OTP Sent Successfully`,
      otp,
    })
  } catch (error) {
    console.log(error.message)
    return res.status(500).json({ success: false, error: error.message })
  }
}









exports.signup = async (req, res) => {
  try {

    const {
      firstName,
      lastName,
      email,
      password,
      mobileNumber,
      udid,
      otp,
    } = req.body

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !mobileNumber ||
      !otp
    ) {
      return res.status(403).send({
        success: false,
        message: "All Fields are required",
      })
    }


    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists. Please sign in to continue.",
      })
    }


    const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1)
    console.log(response)
    if (response.length === 0) {

      return res.status(405).json({
        success: false,
        message: "The OTP is not valid",
      })
    } else if (otp !== response[0].otp) {

      return res.status(405).json({
        success: false,
        message: "The OTP is not valid",
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      mobileNumber,
      udid,
      // active: true,
      image: `https://api.dicebear.com/7.x/initials/svg?seed=${firstName}&backgroundType=gradientLinear&fontFamily=Arial&fontSize=56&chars=1`
      // dateOfBirth: null,
      // gender: null,
      // disabilityType: null,
      // assistiveDevice: null,
      // skills: null,
      // education: null,
      // institute: null,
    })

    return res.status(200).json({
      success: true,
      user,
      message: "User registered successfully",
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "User cannot be registered. Please try again.",
    })
  }
}


// `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,

// `https://api.dicebear.com/7.x/initials/svg?seed=${firstName}&backgroundType=solid,gradientLinear&chars=1&fontWeight=500`





exports.login = async (req, res) => {
  try {

    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: `Please Fill up All the Required Fields`,
      })
    }


    const user = await User.findOne({ email })



    if (!user) {

      return res.status(401).json({
        success: false,
        message: `User is not Registered with Us Please SignUp to Continue`,
      })
    }

    // Generate JWT token and Compare Password
    if (await bcrypt.compare(password, user.password)) {
      const token = jwt.sign(
        { email: user.email, id: user._id },
        process.env.JWT_SECRET,
      )

      // Save token to user document in database
      // user.token = token
      // user.password = undefined
      // Set cookie for token and return success response
      // const options = {
      //   expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      //   httpOnly: true,
      // }
      // res.cookie("token", token, options).status(200).json({
      //   success: true,
      //   token,
      //   user,
      //   message: `User Login Success`,
      // })
      res.status(200).json({
        success: true,
        token,
        user,
        message: `User Login Success`,
      })
    } else {
      return res.status(402).json({
        success: false,
        message: `Password is incorrect`,
      })
    }
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      success: false,
      message: `Login Failure Please Try Again`,
    })
  }
}



