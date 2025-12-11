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

//registrer POST ved brukt av fetch i login.js
router.post('/signup', async (req, res) => {
  const { email, phone, password } = req.body;

  try { //validering
    if (!email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'E-post, telefonnummer og passord må fylles inn her',
      });
    }

    //sjekker om epost eller telefon allerede er i bruk
    const [existingEmail] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingEmail.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: 'E-post er allerede i Bruk' });
    }

    //sjekker telefon
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
    
    //setter inn ny bruker i databasen
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


//login POST
router.post('/login', async (req, res) => {
  try {

    const { email, password } = req.body; //henter email og passord fra body

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

    //sjekker passord
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res
        .status(400)
        .json({ success: false, message: 'Feil e-post eller passord' });
    }

    if (!user.phone) { //sjekker om bruker har telefonnummr
      return res.status(400).json({
        success: false,
        message: 'Det er ikke registrert telefonnummer på denne brukeren',
      });
    }

    //lagrer brukeren i session for 2FA
    req.session.pendingUserId = user.id;
    req.session.pendingUserPhone = user.phone;

    //send sms med kode via twilio verify 
    await twilioClient.verify.v2
      .services(verifyServiceSid)
      .verifications
      .create({
        to: user.phone,
        channel: 'sms'
      });

      //sier ifra til frontend at 2FA kreves
    return res.json({ 
      success: true, 
      requires2FA: true, 
      message: 'kode sendt til telefon'
    });

    //catch twilio feil
  } catch (twilioError) {
    console.error('Twilio feil i /login:', twilioError);
    return res.status(500).json({
      success: false,
      message: 'kunne ikke sende sms kode. sjekk telefonnummeret eller kontakt administrator.',
     });
    }
  });

  //2fa POST
  router.post('/2fa', async (req, res) => {
    try {
      console.log('SESSION I /2fa:', req.session);

      const { code } = req.body;
      if (!req.session.pendingUserId || !req.session.pendingUserPhone) {
        return res.status(400).json({ success: false, message: 'Ingen 2FA forespørsel gående' });
      }
    const result = await twilioClient.verify.v2.services(verifyServiceSid).verificationChecks.create({ to: req.session.pendingUserPhone, code: code });

    if (result.status !=='approved'){
      return res.status(400).json({ success: false, message: 'Ugyldig kode' });
    }

    //2FA ok, logg inn
    req.session.user = {
      id: req.session.pendingUserId
    };

    //rydder så opp
    delete req.session.pendingUserId;
    delete req.session.pendingUserPhone;

    return res.json({ success: true, message: 'Innlogging vellykket', redirect: '/' });

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

