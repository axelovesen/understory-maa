var express = require('express');
var router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');

const twilio = require('twilio');
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const verifyServiceSid = process.env.TWILIO_VERIFY_SID;

// Registrer (POST) – brukt av fetch i login.js
router.post('/signup', async (req, res) => {
  const { email, phone, password } = req.body;

  try {
    if (!email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'E-post, telefonnummer og passord må fylles inn her',
      });
    }

    const [existingEmail] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingEmail.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: 'E-post er allerede i Bruk' });
    }

    const [existingPhone] = await pool.query(
      'SELECT * FROM users WHERE phone = ?',
      [phone]
    );
    if (existingPhone.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: 'Telefonnummer er allerede i bruk' });
    }

    const hash = await bcrypt.hash(password, 10);
    
    await pool.query(
      'INSERT INTO users (email, phone, password_hash) VALUES (?, ?, ?)',
      [email, phone, hash] //4 verdier
    );

    return res.json({
      success: true,
      message: 'Bruker opprettet. Du kan logge inn.',
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Noe gikk galt under registreringen.',
    });
  }
});

// Login 
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// Login (POST)
router.post('/login', async (req, res) => {
  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: 'E-post og passord må fylles inn her' 
        });
    }

    const [rows] = await pool.query(
      'SELECT id, email, phone, password_hash FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: 'Feil e-post eller passord' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res
        .status(400)
        .json({ success: false, message: 'Feil e-post eller passord' });
    }

    //lagrer brukeren i session for 2FA
    req.session.pendingUserId = user.id;
    req.session.pendingUserPhone = user.phone;

    //send sms med kode via twilio verify 
    await twilioClient.verify.v2
      .services(verifyServiceSid)
      .verifications
      .create({
        to: req.session.pendingUserPhone, //brukerens telefonnummer fra session
        channel: 'sms'
      });

      //send bruker videre til 2FA-siden, sier ifra til frontend
    return res.json({ success: true, requires2FA: true, message: 'kode sendt til telefon'
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Noe gikk galt under innloggingen.',
     });
    }
  });

  //2fa (GET)
  router.post('/2fa', async (req, res) => {
    try {
      const { code } = req.body;
      if (!req.session.pendingUserId || !req.session.pendingUserPhone) {
        return res.status(400).json({ success: false, message: 'Ingen 2FA forespørsel gående' });
      }
    const result = await twilioClient.verify.v2.services(verifyServiceSid).verificationChecks.create({ to: req.session.pendingUserPhone, code: code });

    if (result.status !=='approved'){
      return res.status(400).json({ success: false, message: 'Ugyldig kode' });
    }

    //2FA ok , logg inn
    req.session.user = {
      id: req.session.pendingUserId
    };

    //Rydder så opp
    delete req.session.pendingUserId;
    delete req.session.pendingUserPhone;

    return res.json({ success: true, message: 'Innlogging vellykket', redirect: '/understory-toplist' });

  }catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Noe gikk galt under 2FA' });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;



