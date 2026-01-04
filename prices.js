const hamburger = document.getElementById("hamburger");
const nav = document.getElementById("nav");

hamburger.addEventListener('click', () => {
  nav.classList.toggle("active");
});

// PRIX CRYPTO EN TEMPS RÉEL 
async function loadPrices() {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,tether&vs_currencies=usd"
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`); // ✅ CORRIGÉ ICI
    }
    
    const data = await response.json();
    
    document.getElementById("btc-price").textContent =
      "$" + data.bitcoin.usd.toLocaleString();
    document.getElementById("eth-price").textContent =
      "$" + data.ethereum.usd.toLocaleString();
    document.getElementById("bnb-price").textContent =
      "$" + data.binancecoin.usd.toLocaleString();
    document.getElementById("usdt-price").textContent =
      "$" + data.tether.usd.toLocaleString();
      
  } catch (error) {
    console.error("Erreur chargement prix :", error);
    
    // Afficher un message d'erreur aux utilisateurs
    document.getElementById("btc-price").textContent = "Erreur";
    document.getElementById("eth-price").textContent = "Erreur";
    document.getElementById("bnb-price").textContent = "Erreur";
    document.getElementById("usdt-price").textContent = "Erreur";
  }
}

// Charger les prix au démarrage
loadPrices();

// Actualiser toutes les 30 secondes
setInterval(loadPrices, 30000);