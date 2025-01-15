const express = require('express');
const { check, body } = require('express-validator');
const User = require('../models/user');

const authController = require('../controllers/auth');

const router = express.Router();

router.get('/login', authController.getLogin);
router.get('/signup', authController.getSignup);

router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please Enter a valid Email')
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (!userDoc) {
            return Promise.reject('E-Mail doesent exists.');
          }
        });
      })
      .normalizeEmail(),
  ],
  authController.postLogin,
);

router.post(
  '/signup',
  [
    check('email')
      .isEmail()
      .withMessage('Please Enter a valid Email')
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject('E-Mail exists already, please pick a different one.');
          }
        });
      })
      .normalizeEmail(),

    body('password', 'Password should be at least 3 characters long').isLength({ min: 3 }),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords must match!');
      }
      return true;
    }),
  ],
  authController.postSignup,
);


router.post('/logout', authController.postLogout);
router.get('/reset', authController.getReset);
router.post('/reset', authController.postReset);
router.get('/reset/:token', authController.getNewPassword);
router.post('/reset/new-password', authController.postNewPassword);

module.exports = router;
