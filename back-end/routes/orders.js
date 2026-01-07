const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Order = require('../models/Order');
const nodemailer = require('nodemailer');

// ================= CONFIG =================

// Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer (upload temporaire)
const upload = multer({ dest: 'uploads/' });

// NodeMailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ================= ROUTES =================

// POST : Créer une commande
router.post('/create', upload.single('screenshot'), async (req, res) => {
  try {
    // 1. Upload image
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'congo-crypto-orders'
    });

    // 2. Création commande
    const orderData = {
      orderNumber: req.body.orderNumber,
      type: req.body.type,
      crypto: req.body.crypto,
      amountUSD: req.body.amountUSD,
      amountCFA: req.body.amountCFA,
      walletAddress: req.body.walletAddress || null,
      phoneNumber: req.body.phoneNumber || null,
      screenshotUrl: result.secure_url
    };

    const order = new Order(orderData);
    await order.save();

    // ✅ 3. RÉPONSE IMMÉDIATE (CRITIQUE)
    return res.status(201).json({
      success: true,
      message: 'Commande créée avec succès',
      orderNumber: orderData.orderNumber
    });

  } catch (error) {
    console.error('Erreur création commande :', error.message);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la commande'
    });
  }
});

// ================= EMAIL ASYNCHRONE =================
// ⚠️ Découplé pour éviter tout blocage

router.post('/notify-email', async (req, res) => {
  try {
    const { orderData, screenshotUrl } = req.body;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `🔔 Nouvelle commande ${orderData.type} - ${orderData.orderNumber}`,
      html: `
        <h2>Nouvelle commande reçue !</h2>
        <p><strong>Numéro :</strong> ${orderData.orderNumber}</p>
        <p><strong>Type :</strong> ${orderData.type}</p>
        <p><strong>Crypto :</strong> ${orderData.crypto}</p>
        <p><strong>Montant USD :</strong> $${orderData.amountUSD}</p>
        <p><strong>Montant CFA :</strong> ${orderData.amountCFA}</p>
        <p><strong>Capture :</strong> <a href="${screenshotUrl}">Voir la capture</a></p>
      `
    };

    await transporter.sendMail(mailOptions);

    return res.json({ success: true });

  } catch (err) {
    console.error("Erreur email :", err.message);
    return res.status(500).json({ success: false });
  }
});

// GET : une commande
router.get('/:orderNumber', async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande introuvable'
      });
    }

    return res.json({
      success: true,
      order
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// GET : toutes les commandes (admin)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    return res.json({
      success: true,
      orders
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// PUT : statut commande
router.put('/:orderNumber/status', async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { orderNumber: req.params.orderNumber },
      { status: req.body.status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande introuvable'
      });
    }

    return res.json({
      success: true,
      message: 'Statut mis à jour',
      order
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

module.exports = router;