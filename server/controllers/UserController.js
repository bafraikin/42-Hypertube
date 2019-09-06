const bcrypt = require('bcryptjs');
const UserModel = require('../models/UserModel');
const jwt = require('jsonwebtoken');
const keys = require('../config/keys');

const emailIsOK = email => {
      const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return regex.test(String(email).toLowerCase());
};
const firstNameIsOK = firstName => {
      const regex = /^[A-Za-zÀ-ÖØ-öø-ÿ-]{3,15}$/;
      return regex.test(String(firstName));
};
const lastNameIsOK = lastName => {
      const regex = /^[A-Za-zÀ-ÖØ-öø-ÿ]{3,15}$/;
      return regex.test(String(lastName));
};
const usernameIsOK = username => {
      const regex = /^[A-Za-zÀ-ÖØ-öø-ÿ]{5,10}$/;
      return regex.test(String(username));
};
const passwordIsOK = password => {
      const regex = /^(?:(?=.*?[A-Z])(?:(?=.*?[0-9])(?=.*?[-!@#$%^&*()_[\]{},.<>+=])|(?=.*?[a-z])(?:(?=.*?[0-9])|(?=.*?[-!@#$%^&*()_[\]{},.<>+=])))|(?=.*?[a-z])(?=.*?[0-9])(?=.*?[-!@#$%^&*()_[\]{},.<>+=]))[A-Za-z0-9!@#$%^&*()_[\]{},.<>+=-]{6,50}$/;
      return regex.test(String(password));
};

const newUserIsOK = async (email, firstName, lastName, username, password) => {
    try {
        const helpers = {
              errors: [],
              taken: [],
        };
        if (!emailIsOK(email)) { helpers.errors.push('email') };
        if (!firstNameIsOK(firstName)) { helpers.errors.push('firstName') };
        if (!lastNameIsOK(lastName)) { helpers.errors.push('lastName') };
        if (!usernameIsOK(username)) { helpers.errors.push('username') };
        if (!passwordIsOK(password)) { helpers.errors.push('password') };
        const emailExists = await UserModel.findOne({ email });
        if (emailExists) { helpers.taken.push('email') };
        const usernameExists = await UserModel.findOne({ username });
        if (usernameExists) { helpers.taken.push('username') };
        return helpers;
    } catch(err) {
        console.log(err);
    }
};

const findOrCreateUser = (req, res) => {
    try {
        const manageNewUser = async ({ email, firstName, lastName, username, password }) => {
            const helpers = await newUserIsOK(email, firstName, lastName, username, password);
            if (helpers.errors.length !== 0 || helpers.taken.length !== 0) {
                res.status(400).json(helpers);
                return;
            }
            bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash(password, salt, async (err, hash) => {
                    const newUser = new User({
                        email: req.body.email,
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        username: req.body.username,
                        password: hash
                    });
                    const user = await UserModel.collection.insertOne(newUser)
                    res.status(200).json({ message: 'User created' });
                });
            });
        };
        manageNewUser(req.body);
    } catch(err) { console.log(err) }
};

const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await UserModel.findOne({ username });
        if (user !== null) {
            bcrypt.compare(password, user.password, (err, result) => {
                if (result) {
                    const authToken = jwt.sign({ mongoId: user._id }, keys.JWT_SECRET, { expiresIn: '6h' });
                    res.status(200).json({ authToken });
                } else {
                    res.status(401).json({ errorMsg: 'wrong credentials' });
                }
            });
        } else {
            res.status(401).json({ errorMsg: 'wrong credentials' });
        }
    } catch(err) { res.status(401).json({ errorMsg: 'something went wrong' }); }
};

const getMyProfile = async (req, res) => {
    try {
        const { authToken } = req.query;
        jwt.verify(authToken, keys.JWT_SECRET, async (err, decoded) => {
            const _id = decoded.mongoId;
            const data = await UserModel.findOne({ _id });
            const user = {
                username: data.username,
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
            };
            res.status(200).json({ user });
        });
    } catch(err) { res.status(401).json({ error: 'something went wrong' }); }
};

module.exports = {
    findOrCreateUser,
    loginUser,
    getMyProfile,
};
