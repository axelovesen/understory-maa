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

//Registrer (GET)
router.get('/signup', (req, res) => {
  res.render('signup', { error: null });
});

// Registrer (POST) – brukt av fetch i login.js
router.post('/signup', async (req, res) => {
  const { name, email, password, phone } = req.body;

  try {
    if (!email || !password || !phone) {
      return res.render('signup', { error: 'E-post, telefonnummer og passord må fylles inn.' });
    }

    const [existing] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: 'E-post er allerede i Bruk' });
    }

    const hash = await bcrypt.hash(password, 10);
    
    await pool.query(
      'INSERT INTO users (name, email, phone, password_hash) VALUES (?, ?, ?, ?)',
      [name, email, phone, hash] //4 verdier
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
  const { email, phone, password } = req.body;

  try {
    if (!email || !phone || !password) {
      return res
        .status(400)
        .json({ success: false, message: 'E-post, telefonnummer og passord må fylles inn her' });
    }

    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: 'Feil e-post, telefonnummer eller passord' });
    }

    const user = rows[0];
    
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res
        .status(400)
        .json({ success: false, message: 'Feil e-post eller passord' });
    }

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

      //send bruker videre til 2FA-siden
      return res.redirect('/2fa');
    } catch (error){
      console.error(error);
      res.render('login', {error: 'Noe gikk galt under innloggingen'});
    }
  });

  //2fa (GET)
  router.get('/2fa', (req, res)=>{
    //sjekk at vi har pendingUserId i session
    if(!req.session.pendingUserId){
      return res.redirect('/login');
    }

    res.render('2fa', {error: null});
  });

  //2fa (POST)
  router.post('/2fa', async (req, res)=>{
    const code = req.body.code;

    try{
      const result = await twilioClient.verify.v2
      .services(verifyServiceSid)
      .verificationChecks
      .create({
        to: req.session.pendingUserPhone,
        code: code 
      });

      if(result.status === 'approved'){
        //nå logger vi inn ordentlig
        req.session.user = {
          id: req.session.pendingUserId
          // evt. legge til navn og email hvis det trengs senere
        };

        //rydd opp 
        delete req.session.pendingUserId;
        delete req.session.pendingUserPhone;

        //redirect til toplist
        return res.redirect('/understory-toplist');
      }

      return res.render('2fa', {error: 'Feil kode, Prøv igjen.' });

    }catch (error){
      console.error(error);
      return res.render('2fa', {error: 'Noe gikk galt, prøv igjen '});
    }
  })

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;



