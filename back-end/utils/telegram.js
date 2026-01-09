const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });

async function sendNotification(orderData) {
  try {
    const typeEmoji = orderData.type === 'ACHAT' ? '🟢' : '🔵';
    
    const message = `
${typeEmoji} *NOUVELLE COMMANDE ${orderData.type}*

━━━━━━━━━━━━━━━━━━━━
📋 *Numéro:* \`${orderData.orderNumber}\`
💰 *Crypto:* ${orderData.crypto}
💵 *Montant:* $${orderData.amountUSD}
💴 *CFA:* ${orderData.amountCFA}
${orderData.walletAddress ? `\n🏦 *Adresse client:* \`${orderData.walletAddress}\`` : ''}
${orderData.phoneNumber ? `\n📱 *Téléphone:* ${orderData.phoneNumber}` : ''}
⏰ *Date:* ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Brazzaville' })}
━━━━━━━━━━━━━━━━━━━━

✅ Connecte-toi au dashboard pour traiter cette commande.
    `;

    // Envoyer le message avec boutons
    await bot.sendMessage(process.env.TELEGRAM_CHAT_ID, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '👁️ Voir sur Dashboard', url: 'https://bella-exchange.xyz/admin.html' }
          ]
        ]
      }
    });

    // Envoyer la capture d'écran
    await bot.sendPhoto(process.env.TELEGRAM_CHAT_ID, orderData.screenshotUrl, {
      caption: `📸 Capture de paiement - ${orderData.orderNumber}`
    });

    console.log('✅ Notification Telegram envoyée');
    return true;

  } catch (error) {
    console.error('❌ Erreur Telegram:', error);
    return false;
  }
}

module.exports = { sendNotification };
