import { User } from '../models/user.model.js'; // Keep only one import
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import {File} from '../models/file.model.js'



const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const signUp = async (req, res) => {
    const { firstname, lastname, password, email, simplePrice, intermediatePrice, advancePrice, agreeToTerms, availableTime } = req.body;
    try {
        if (!firstname || !lastname || !password || !email ||!simplePrice || !intermediatePrice || !advancePrice || !agreeToTerms || !availableTime) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const userAlreadyExists = await User.findOne({ email });
        if (userAlreadyExists) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcryptjs.hash(password, 10);

        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

        const user = new User({
            firstname,
            lastname,
            password: hashedPassword,
            email,
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
            simplePrice,  // Save simplePrice to the database
            intermediatePrice,  // Save intermediatePrice to the database
            advancePrice,  // Save advancePrice to the database
            agreeToTerms,
            availableTimes: availableTime  // Save availableTime
        });

        user.save().then((result)=>{
            const transporter = nodemailer.createTransport( {
                  service: 'gmail',
                  auth: {
                    user: process.env.MAIL_USERNAME,
                    pass: process.env.MAIL_PASSWORD
                  }
                });
                var mailOptions = {
                to: req.body.email,
                from:process.env.MAIL_USERNAME,
                subject:"password reset",
              text:`your verification code is ${verificationToken}`
                };
                transporter.sendMail(mailOptions, function(error, info) {
                    if(error) {
                        console.log(error);
                    }
                    else {
                        console.log('Email sent:' + info.response)
                    }
                  });
            res.json({message:"check your email"})
        })

       
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ error: 'User does not exist' });
        }

        if (user.verificationToken !== otp || user.verifiationTokenExpiresAt < Date.now()) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verifiationTokenExpiresAt = undefined;
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_KEY, { expiresIn: '3h' });

        res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

        res.status(200).json({ message: 'Account verified successfully. You are now logged in.' });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'User does not exist' });
        }

        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        if (!user.isVerified) {
            return res.status(400).json({ error: 'Account not verified. Please check your email for the OTP.' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_KEY, { expiresIn: '3h' });

        res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

        res.status(200).json({ message: 'Login successful' });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


export const logout = async (req, res) => {
    res.send('logout');
};

// multer 
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import multer from 'multer';

// Get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Multer Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + file.originalname;
    cb(null, uniqueSuffix);
  }
});

const upload = multer({ storage: storage });

// Define the uploadFile function
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }
    const fileData = new File({
        originalname: req.file.originalname,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path
      });
  
      await fileData.save();
  
    
    console.log(req.file); // Log file details
    res.status(200).send('File uploaded successfully.');
  } catch (error) {
    res.status(500).send('File upload failed.');
    console.log(error)
  }
};

// Export the upload function as an array to be used in routes
export const uploads = [upload.single('file'), uploadFile];
