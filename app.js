// Initialisation globale de l'application ERP
document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();
    initDB();
    initNavigation();
    initCharts();
    initSimulator();
    initEnergyCalculations();
    initAIChatAndScanner();
    renderAllData();
    initModalEvents();
});

// Structure par défaut de la base de données
const DEFAULT_LOTS = [
    { code: "L-2607A", date: "2026-07-01", product: "Tomate Cerise", supplier: "Coop Souss", weight: 8000, yield: 82, purchasePrice: 0.80, costPrice: 1.84, status: "Terminé", destination: "France (Rungis)", packingCost: 0.38, laborHours: 32, freightCost: 0.75 },
    { code: "L-2607B", date: "2026-07-02", product: "Haricot Vert", supplier: "AgroAtlas", weight: 6500, yield: 75, purchasePrice: 0.95, costPrice: 2.15, status: "En cours", destination: "Allemagne (Munich)", packingCost: 0.42, laborHours: 28, freightCost: 0.85 },
    { code: "L-2608A", date: "2026-07-03", product: "Agrumes (Clémentines)", supplier: "Clémentines du Sud", weight: 12000, yield: 88, purchasePrice: 0.70, costPrice: 1.62, status: "Terminé", destination: "Espagne (Barcelone)", packingCost: 0.35, laborHours: 40, freightCost: 0.70 }
];

const DEFAULT_LOGS = [
    { type: "info", time: "08:12:04", msg: "Démarrage de la station de conditionnement. Ligne A et B actives." },
    { type: "success", time: "08:14:25", msg: "Arrivage Lot L-2608A validé. Qualité agréage : A (Excellent)." },
    { type: "warning", time: "09:30:11", msg: "Alerte : Température frigo 2 détectée à 6°C (Cible < 4°C). Correction automatique activée." },
    { type: "info", time: "10:15:00", msg: "Expédition du Lot L-2607A vers Rungis, France (Conteneur RF-8842)." }
];

const DEFAULT_CONSOMMABLES = [
    { name: "Cartons Export 5Kg", usage: "Colisage principal", cost: 0.25, stock: 12400, status: "Optimal" },
    { name: "Palettes Europe (Bois)", usage: "Palettisation", cost: 12.00, stock: 450, status: "Optimal" },
    { name: "Barquettes Plastiques 250g", usage: "Conditionnement unitaire", cost: 0.08, stock: 42000, status: "Optimal" },
    { name: "Cornières & Films", usage: "Fardelage", cost: 0.05, stock: 1500, status: "Seuil Bas" }
];

const DEFAULT_TRAITEMENTS = [
    { name: "Cire de carnauba (Citrosol)", usage: "Enrobage agrumes", dosage: "1.2 L / Tonne", cost: 6.50 },
    { name: "Fludioxonil (Fongicide)", usage: "Traitement post-récolte", dosage: "300 ml / 100 L", cost: 45.00 },
    { name: "Solution assainissante", usage: "Désinfection eau lavage", dosage: "50 ppm", cost: 2.20 }
];

const DEFAULT_FOURNISSEURS = [
    { name: "Coopérative Souss", region: "Taroudant", contracts: "Tomates, Agrumes", waste: "12%", volume: "420 Tonnes", status: "Payé" },
    { name: "AgroAtlas Maroc", region: "Agadir", contracts: "Haricots Verts", waste: "18%", volume: "280 Tonnes", status: "En cours" },
    { name: "Clémentines du Sud", region: "Berkane", contracts: "Agrumes", waste: "8%", volume: "650 Tonnes", status: "Payé" },
    { name: "Maraîchers du Loukkos", region: "Larache", contracts: "Courgettes", waste: "15%", volume: "190 Tonnes", status: "En cours" }
];

const DEFAULT_CLIENTS = [
    { name: "EuroFood Rungis", destination: "France", activeOrders: 2, volume: "45 Tonnes", billing: "98,500 EUR", status: "Réglé" },
    { name: "Munich Fresh Fruit", destination: "Allemagne", activeOrders: 1, volume: "22 Tonnes", billing: "48,200 EUR", status: "Attente" },
    { name: "Mercabarna Import", destination: "Espagne", activeOrders: 3, volume: "64 Tonnes", billing: "128,400 EUR", status: "Réglé" }
];

const DEFAULT_HR = [
    { name: "Yassine El Fassi", role: "Chef de Ligne de Tri", rate: 18.50, hours: 160, salary: "2,960.00 EUR", status: "Validé" },
    { name: "Amina Aït Ali", role: "Opérateur de Calibrage", rate: 12.00, hours: 155, salary: "1,860.00 EUR", status: "Validé" },
    { name: "Khadija Soussi", role: "Opérateur de Conditionnement", rate: 12.00, hours: 162, salary: "1,944.00 EUR", status: "En cours" },
    { name: "Rachid Idrissi", role: "Cariste / Frigoriste", rate: 15.00, hours: 158, salary: "2,370.00 EUR", status: "Validé" }
];

function initDB() {
    if (!localStorage.getItem("agrico_lots")) {
        localStorage.setItem("agrico_lots", JSON.stringify(DEFAULT_LOTS));
    }
    if (!localStorage.getItem("agrico_logs")) {
        localStorage.setItem("agrico_logs", JSON.stringify(DEFAULT_LOGS));
    }
    if (!localStorage.getItem("agrico_consommables")) {
        localStorage.setItem("agrico_consommables", JSON.stringify(DEFAULT_CONSOMMABLES));
    }
    if (!localStorage.getItem("agrico_fournisseurs")) {
        localStorage.setItem("agrico_fournisseurs", JSON.stringify(DEFAULT_FOURNISSEURS));
    }
    if (!localStorage.getItem("agrico_clients")) {
        localStorage.setItem("agrico_clients", JSON.stringify(DEFAULT_CLIENTS));
    }
    if (!localStorage.getItem("agrico_hr")) {
        localStorage.setItem("agrico_hr", JSON.stringify(DEFAULT_HR));
    }
}

function getLots() {
    return JSON.parse(localStorage.getItem("agrico_lots"));
}

function saveLots(lots) {
    localStorage.setItem("agrico_lots", JSON.stringify(lots));
}

function addLog(type, msg) {
    const logs = JSON.parse(localStorage.getItem("agrico_logs")) || [];
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    logs.unshift({ type, time: timeStr, msg });
    localStorage.setItem("agrico_logs", JSON.stringify(logs.slice(0, 50)));
    renderLogs();
}

// Navigation & Onglets
function initNavigation() {
    const menuItems = document.querySelectorAll(".menu-item");
    const viewSections = document.querySelectorAll(".view-section");
    const pageTitle = document.getElementById("page-main-title");
    const pageSubtitle = document.getElementById("page-subtitle");

    const tabMeta = {
        dashboard: { title: "Tableau de bord de pilotage", subtitle: "Suivi en temps réel des lots de fruits & légumes destinés à l'Europe" },
        receptions: { title: "Lots & Réceptions", subtitle: "Registre des apports de matières premières et agréage qualité" },
        fournisseurs: { title: "Fournisseurs & Coopératives", subtitle: "Base d'approvisionnement, contrats de culture et agréage" },
        tri: { title: "Suivi des Lignes de Tri", subtitle: "Rendements de tri, pack-out rate et contrôle des rebuts" },
        consommables: { title: "Nomenclature des Consommables & Traitements", subtitle: "Contrôle des intrants de traitement de conservation et emballages" },
        frigos: { title: "Efficacité Énergétique des Chambres Froides", subtitle: "Consommation électrique et coûts énergétiques en temps réel" },
        clients: { title: "Clients & Commandes Exportation Europe", subtitle: "Suivi de la facturation et des contrats B2B" },
        expeditions: { title: "Expéditions d'Export", subtitle: "Suivi logistique et fret maritime / routier vers l'Europe" },
        hr: { title: "Ressources Humaines & Paie de Station", subtitle: "Suivi horaire, taux d'activité et calcul de la masse salariale" },
        costs: { title: "Calcul des Coûts de Revient", subtitle: "Analyse globale de rentabilité financière et marge par lot" },
        analytics: { title: "Analytiques Avancés", subtitle: "Marges opérationnelles consolidées, structure de coûts et écarts" },
        ia: { title: "Assistant IA & Rapports de Synthèse", subtitle: "Génération automatique des audits financiers et de logistique" }
    };

    menuItems.forEach(item => {
        item.addEventListener("click", () => {
            const targetTab = item.getAttribute("data-tab");
            
            menuItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");

            viewSections.forEach(sec => {
                sec.classList.remove("active");
                if (sec.getAttribute("id") === `view-${targetTab}`) {
                    sec.classList.add("active");
                }
            });

            pageTitle.textContent = tabMeta[targetTab].title;
            pageSubtitle.textContent = tabMeta[targetTab].subtitle;

            renderAllData();
        });
    });
}

// Graphiques Globaux
let costChart = null;
let wasteChart = null;
let marginsChart = null;
let structureChart = null;

function initCharts() {
    const ctxCost = document.getElementById('costBreakdownChart').getContext('2d');
    costChart = new Chart(ctxCost, {
        type: 'bar',
        data: {
            labels: ['Structure de coût (€/Kg exporté)'],
            datasets: [
                { label: 'Achat Matière', data: [0.80], backgroundColor: '#10b981' },
                { label: 'Écart de Tri', data: [0.20], backgroundColor: '#ef4444' },
                { label: 'Emballage & Traitement', data: [0.38], backgroundColor: '#3b82f6' },
                { label: 'Fret & Électricité', data: [0.75], backgroundColor: '#a855f7' }
            ]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { stacked: true, max: 3.0 },
                y: { stacked: true }
            },
            plugins: {
                legend: { position: 'bottom', labels: { boxWidth: 12 } }
            }
        }
    });

    const ctxWaste = document.getElementById('wasteDistributionChart').getContext('2d');
    wasteChart = new Chart(ctxWaste, {
        type: 'doughnut',
        data: {
            labels: ['Déchets / Compost', 'Marché Local (2ème choix)', 'Pertes Manipulation'],
            datasets: [{
                data: [60, 35, 5],
                backgroundColor: ['#ef4444', '#f59e0b', '#64748b']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { boxWidth: 12 } }
            }
        }
    });

    const ctxMarges = document.getElementById('analyticsMargesChart').getContext('2d');
    marginsChart = new Chart(ctxMarges, {
        type: 'line',
        data: {
            labels: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin'],
            datasets: [
                { label: 'Tomate Cerise', data: [18, 22, 20, 24, 25, 23], borderColor: '#10b981', tension: 0.2, fill: false },
                { label: 'Haricot Vert', data: [15, 14, 16, 15, 18, 17], borderColor: '#3b82f6', tension: 0.2, fill: false },
                { label: 'Agrumes', data: [12, 15, 13, 12, 14, 16], borderColor: '#f97316', tension: 0.2, fill: false }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });

    const ctxStructure = document.getElementById('analyticsStructureChart').getContext('2d');
    structureChart = new Chart(ctxStructure, {
        type: 'polarArea',
        data: {
            labels: ['Achat Brut', 'Tri & Rebuts', 'Cartons & Palettes', 'Fret Export', 'Énergie Froide', 'Main d\'œuvre'],
            datasets: [{
                data: [42, 18, 15, 12, 5, 8],
                backgroundColor: ['#10b981', '#ef4444', '#3b82f6', '#a855f7', '#f59e0b', '#64748b']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { boxWidth: 12 } }
            }
        }
    });
}

// Simulateur de Coût de Revient
function initSimulator() {
    const inputs = [
        'sim-input-weight', 'sim-purchase-price', 'sim-waste-rate',
        'sim-packing-cost', 'sim-labor-cost', 'sim-freight-cost'
    ];

    inputs.forEach(id => {
        document.getElementById(id).addEventListener('input', updateSimulation);
    });

    updateSimulation();
}

function updateSimulation() {
    const rawWeight = parseFloat(document.getElementById('sim-input-weight').value) || 0;
    const purchasePrice = parseFloat(document.getElementById('sim-purchase-price').value) || 0;
    const wasteRate = parseFloat(document.getElementById('sim-waste-rate').value) || 0;
    const packingCost = parseFloat(document.getElementById('sim-packing-cost').value) || 0;
    const laborHourly = parseFloat(document.getElementById('sim-labor-cost').value) || 0;
    const freightCost = parseFloat(document.getElementById('sim-freight-cost').value) || 0;

    document.getElementById('waste-val').innerText = `${wasteRate}%`;

    const yieldRate = 100 - wasteRate;
    const exportWeight = rawWeight * (yieldRate / 100);

    const totalPurchaseCost = rawWeight * purchasePrice;
    const rawMaterialCostPerKgExport = exportWeight > 0 ? (totalPurchaseCost / exportWeight) : 0;
    const wasteCostPerKgExport = rawMaterialCostPerKgExport - purchasePrice;

    const estimatedHours = rawWeight / 250;
    const totalLaborCost = estimatedHours * laborHourly;
    const laborCostPerKgExport = exportWeight > 0 ? (totalLaborCost / exportWeight) : 0;

    const totalPackingCost = exportWeight * packingCost;
    const totalFreightCost = exportWeight * freightCost;

    const totalLotCost = totalPurchaseCost + totalLaborCost + totalPackingCost + totalFreightCost;
    const totalCostPerKgExport = exportWeight > 0 ? (totalLotCost / exportWeight) : 0;

    document.getElementById('res-export-weight').innerText = `${exportWeight.toLocaleString('fr-FR')} kg`;
    document.getElementById('res-yield').innerText = `${yieldRate}%`;
    document.getElementById('res-total-cost-kg').innerText = `${totalCostPerKgExport.toFixed(2)} €/kg`;
    document.getElementById('res-total-lot-cost').innerText = `${totalLotCost.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

    if (costChart) {
        costChart.data.datasets[0].data = [purchasePrice];
        costChart.data.datasets[1].data = [wasteCostPerKgExport];
        costChart.data.datasets[2].data = [packingCost + laborCostPerKgExport];
        costChart.data.datasets[3].data = [freightCost];
        costChart.options.scales.x.max = Math.ceil(totalCostPerKgExport + 0.5);
        costChart.update();
    }
}

// Calculs d'Énergie et Consignes Chambres Froides
let frigoConsignes = { frigo1: 4, frigo2: 2, frigo3: 8 };

function initEnergyCalculations() {
    const inputs = ['consigne-1', 'consigne-2', 'consigne-3', 'kwh-price'];
    inputs.forEach(id => {
        document.getElementById(id).addEventListener('input', calculateEnergyCosts);
    });

    calculateEnergyCosts();
}

function calculateEnergyCosts() {
    const c1 = parseFloat(document.getElementById('consigne-1').value) || 4;
    const c2 = parseFloat(document.getElementById('consigne-2').value) || 2;
    const c3 = parseFloat(document.getElementById('consigne-3').value) || 8;
    const priceKWh = parseFloat(document.getElementById('kwh-price').value) || 0.18;

    frigoConsignes.frigo1 = c1;
    frigoConsignes.frigo2 = c2;
    frigoConsignes.frigo3 = c3;

    const kwhFrigo1 = 14.5 * (35 - c1) * 0.08;
    const kwhFrigo2 = 28.0 * (35 - c2) * 0.08;
    const kwhFrigo3 = 8.2 * (35 - c3) * 0.08;

    const costFrigo1 = kwhFrigo1 * priceKWh;
    const costFrigo2 = kwhFrigo2 * priceKWh;
    const costFrigo3 = kwhFrigo3 * priceKWh;

    document.getElementById('temp-frigo-1').innerText = `${c1.toFixed(1)} °C`;
    document.getElementById('temp-frigo-2').innerText = `${c2.toFixed(1)} °C`;
    document.getElementById('temp-frigo-3').innerText = `${c3.toFixed(1)} °C`;

    document.getElementById('cost-frigo-1').innerText = `${costFrigo1.toFixed(2)} €`;
    document.getElementById('cost-frigo-2').innerText = `${costFrigo2.toFixed(2)} €`;
    document.getElementById('cost-frigo-3').innerText = `${costFrigo3.toFixed(2)} €`;

    const totalKWhMonth = (kwhFrigo1 + kwhFrigo2 + kwhFrigo3) * 30;
    const totalCostMonth = totalKWhMonth * priceKWh;

    document.getElementById('res-total-kwh').innerText = `${totalKWhMonth.toLocaleString('fr-FR', {maximumFractionDigits:0})} KWh`;
    document.getElementById('res-total-energy-cost').innerText = `${totalCostMonth.toLocaleString('fr-FR', {minimumFractionDigits: 2, maximumFractionDigits: 2})} €`;
}

// Logiciel Assistant IA et Générateur de Rapports
function initAIChatAndScanner() {
    const btnSend = document.getElementById('btn-ai-send');
    const input = document.getElementById('ai-chat-input');
    const dropzone = document.getElementById('ai-dropzone');
    const badgeFile = document.getElementById('file-uploaded-badge');
    const btnGenerate = document.getElementById('btn-generate-report');
    const selectPeriod = document.getElementById('report-period');
    const reportOutput = document.getElementById('ai-report-output');
    const reportTitle = document.getElementById('ai-report-title');
    const reportText = document.getElementById('ai-report-text');

    if (btnSend && input) {
        btnSend.addEventListener('click', handleChatSubmit);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleChatSubmit();
        });
    }

    if (dropzone) {
        dropzone.addEventListener('click', () => {
            badgeFile.classList.remove('hidden');
            addLog("success", "IA OCR : Facture d'électricité scannée (4,500 KWh extraits).");
            
            const chatBody = document.getElementById('ai-chat-body');
            chatBody.innerHTML += `
                <div class="ai-msg user-msg bg-slate-100 p-3 rounded-lg max-w-[80%] self-end">
                    [Fichier Facture_Electricite.pdf scanné]
                </div>
                <div class="ai-msg bot-msg bg-emerald-50 text-emerald-800 border border-emerald-100 p-3 rounded-lg max-w-[80%] self-start">
                    J'ai extrait les données de la facture d'électricité. La consommation s'élève à 4,500 KWh pour un coût total de 810.00 EUR (Tarif : 0.18 €/KWh). Cela correspond à nos estimations ERP.
                </div>
            `;
            chatBody.scrollTop = chatBody.scrollHeight;
        });
    }

    if (btnGenerate) {
        btnGenerate.addEventListener('click', () => {
            const period = selectPeriod.value;
            reportOutput.classList.remove('hidden');
            
            const titles = {
                jour: "Rapport Décideur Journalier (IA)",
                semaine: "Rapport Décideur Hebdomadaire (IA)",
                mois: "Rapport Décideur Mensuel (IA)",
                trimestre: "Rapport Décideur Trimestriel (IA)"
            };

            const reports = {
                jour: `Audit du jour : 
                - Poids réceptionné : 12,000 kg.
                - Écart de tri global : 15% (Excellent).
                - Consommation chambres froides : 224 KWh.
                - Coût logistique moyen : 0.75 €/kg.
                - Marge nette estimée sur la journée : +19.4%.`,
                
                semaine: `Synthèse de la semaine : 
                - Lots traités : L-2607A, L-2607B, L-2608A.
                - Volume Total : 26,500 kg brut.
                - Coût d'achat moyen : 0.79 €/kg.
                - Le lot L-2607B présente un écart élevé de 25% (Alerte qualité Haricot Vert).
                - Consommation d'emballage : 5,200 cartons de 5kg.
                - Performance MO : 18 kg/heure par opérateur.`,
                
                mois: `Rapport Analytique Mensuel : 
                - Volume d'export vers l'Europe : 108,000 kg.
                - Coût de revient moyen prévalant : 2.01 €/kg.
                - Chiffre d'affaires brut estimé (FOB) : 265,000 EUR.
                - Coûts d'électricité des chambres froides : 1,209.60 EUR (Stabilité de la chaîne du froid).
                - Intrants de conservation consommés : 45L de cire de carnauba.`,
                
                trimestre: `Bilan Trimestriel Consolidé : 
                - Tonnage brut traité : 324 T.
                - Rendement global de tri (Pack-out) : 81.2%.
                - Principale destination d'exportation : France (Rungis) - 48% des volumes.
                - Budget total emballages et consommables : 38,420 EUR.
                - Économies d'énergie générées par le relèvement de la consigne du Frigo 3 : +8% de KWh économisés.`
            };

            reportTitle.innerText = titles[period];
            reportText.innerHTML = reports[period].replace(/\n/g, '<br>');
        });
    }
}

function handleChatSubmit() {
    const input = document.getElementById('ai-chat-input');
    const chatBody = document.getElementById('ai-chat-body');
    const text = input.value.trim();
    if (!text) return;

    chatBody.innerHTML += `
        <div class="ai-msg user-msg bg-slate-100 p-3 rounded-lg max-w-[80%] self-end">
            ${text}
        </div>
    `;
    input.value = "";
    chatBody.scrollTop = chatBody.scrollHeight;

    setTimeout(() => {
        let reply = "Je traite votre requête avec les capteurs connectés... ";
        const lower = text.toLowerCase();
        
        if (lower.includes("énergie") || lower.includes("électricité") || lower.includes("kwh")) {
            reply = "La consommation électrique simulée est de 224 KWh par jour pour l'ensemble des 3 chambres froides, pour un budget mensuel de 1,209.60 EUR. Relever la consigne du frigo 3 (Marché local) à 9°C permettrait d'économiser 5% sur ce poste.";
        } else if (lower.includes("consommables") || lower.includes("cartons") || lower.includes("stock")) {
            reply = "Le stock de cartons de 5Kg est confortable (12,400 restants), mais les cornières & films étirables sont en seuil bas (1,500 unités restantes). Je vous suggère de passer commande d'un lot de rechange.";
        } else if (lower.includes("marge") || lower.includes("coût de revient")) {
            reply = "Le coût de revient moyen actuel est de 2.01 €/kg exporté. La marge moyenne observée est de +18% sur le marché de gros européen.";
        } else {
            reply = "Je peux vous fournir l'analyse énergétique en temps réel des chambres froides, le stock de consommables d'emballage (cartons, palettes) ou la rentabilité par lot.";
        }

        chatBody.innerHTML += `
            <div class="ai-msg bot-msg bg-emerald-50 text-emerald-800 border border-emerald-100 p-3 rounded-lg max-w-[80%] self-start">
                ${reply}
            </div>
        `;
        chatBody.scrollTop = chatBody.scrollHeight;
    }, 700);
}

// Rendu des Données dans les Tableaux
function renderAllData() {
    const lots = getLots();
    updateKPIs(lots);
    renderLogs();
    renderReceptions(lots);
    renderFournisseurs();
    renderTri(lots);
    renderConsommables();
    renderClients();
    renderExpeditions(lots);
    renderHR();
    renderCosts(lots);
}

function updateKPIs(lots) {
    if (lots.length === 0) return;
    const avgYield = lots.reduce((sum, l) => sum + l.yield, 0) / lots.length;
    const avgPacking = lots.reduce((sum, l) => sum + l.packingCost, 0) / lots.length;
    const avgCost = lots.reduce((sum, l) => sum + l.costPrice, 0) / lots.length;

    document.getElementById('kpi-yield').innerText = `${avgYield.toFixed(1)}%`;
    document.getElementById('kpi-packing').innerText = `${avgPacking.toFixed(2)} €/kg`;
    document.getElementById('kpi-cost-price').innerText = `${avgCost.toFixed(2)} €/kg`;
}

function renderLogs() {
    const logs = JSON.parse(localStorage.getItem("agrico_logs")) || [];
    const container = document.getElementById("station-logs-feed");
    if (!container) return;
    
    container.innerHTML = logs.map(l => `
        <div class="log-item ${l.type}">
            <strong>[${l.time}]</strong> ${l.msg}
        </div>
    `).join('');
}

function renderReceptions(lots) {
    const tbody = document.querySelector("#receptions-table tbody");
    if (!tbody) return;
    tbody.innerHTML = lots.map(l => `
        <tr>
            <td style="font-weight:700;">${l.code}</td>
            <td>${l.date}</td>
            <td>${l.product}</td>
            <td>${l.supplier}</td>
            <td>${l.weight.toLocaleString('fr-FR')} kg</td>
            <td>${l.purchasePrice.toFixed(2)} €/kg</td>
            <td><span class="badge-status-table status-completed">Agréé A</span></td>
        </tr>
    `).join('');
}

function renderFournisseurs() {
    const suppliers = JSON.parse(localStorage.getItem("agrico_fournisseurs")) || DEFAULT_FOURNISSEURS;
    const tbody = document.querySelector("#fournisseurs-table tbody");
    if (!tbody) return;
    tbody.innerHTML = suppliers.map(s => `
        <tr>
            <td><strong>${s.name}</strong></td>
            <td>${s.region}</td>
            <td>${s.contracts}</td>
            <td style="color:var(--danger); font-weight:600;">${s.waste}</td>
            <td>${s.volume}</td>
            <td><span class="badge-status-table ${s.status === 'Payé' ? 'status-completed' : 'status-processing'}">${s.status}</span></td>
        </tr>
    `).join('');
}

function renderTri(lots) {
    const tbody = document.querySelector("#tri-table tbody");
    if (!tbody) return;
    tbody.innerHTML = lots.map(l => {
        const wasteWeight = l.weight * ((100 - l.yield) / 100);
        return `
            <tr>
                <td style="font-weight:700;">${l.code}</td>
                <td>${l.product}</td>
                <td>${l.weight.toLocaleString('fr-FR')} kg</td>
                <td style="color:var(--danger); font-weight:600;">${wasteWeight.toLocaleString('fr-FR')} kg</td>
                <td><span style="font-weight:700; color:var(--primary);">${l.yield}%</span></td>
                <td>${l.laborHours} heures</td>
            </tr>
        `;
    }).join('');
}

function renderConsommables() {
    const cons = JSON.parse(localStorage.getItem("agrico_consommables")) || DEFAULT_CONSOMMABLES;
    const tbodyC = document.querySelector("#consommables-table tbody");
    if (tbodyC) {
        tbodyC.innerHTML = cons.map(c => `
            <tr>
                <td><strong>${c.name}</strong></td>
                <td>${c.usage}</td>
                <td>${c.cost.toFixed(2)} €</td>
                <td><strong>${c.stock.toLocaleString('fr-FR')}</strong></td>
                <td><span class="badge-status-table ${c.status === 'Optimal' ? 'status-completed' : 'status-processing'}">${c.status}</span></td>
            </tr>
        `).join('');
    }

    const tbodyT = document.querySelector("#traitements-table tbody");
    if (tbodyT) {
        tbodyT.innerHTML = DEFAULT_TRAITEMENTS.map(t => `
            <tr>
                <td><strong>${t.name}</strong></td>
                <td>${t.usage}</td>
                <td>${t.dosage}</td>
                <td>${t.cost.toFixed(2)} €</td>
            </tr>
        `).join('');
    }
}

function renderClients() {
    const clients = JSON.parse(localStorage.getItem("agrico_clients")) || DEFAULT_CLIENTS;
    const tbody = document.querySelector("#clients-table tbody");
    if (!tbody) return;
    tbody.innerHTML = clients.map(c => `
        <tr>
            <td><strong>${c.name}</strong></td>
            <td>${c.destination}</td>
            <td>${c.activeOrders}</td>
            <td>${c.volume}</td>
            <td><strong>${c.billing}</strong></td>
            <td><span class="badge-status-table ${c.status === 'Réglé' ? 'status-completed' : 'status-processing'}">${c.status}</span></td>
        </tr>
    `).join('');
}

function renderExpeditions(lots) {
    const tbody = document.querySelector("#expeditions-table tbody");
    if (!tbody) return;
    tbody.innerHTML = lots.map(l => {
        const exportWeight = l.weight * (l.yield / 100);
        const statusClass = l.status === "Terminé" ? "status-completed" : "status-processing";
        return `
            <tr>
                <td style="font-weight:700;">${l.code}</td>
                <td>${l.destination || "Europe (Fret)"}</td>
                <td>${exportWeight.toLocaleString('fr-FR')} kg</td>
                <td>${(exportWeight * l.freightCost).toLocaleString('fr-FR', {maximumFractionDigits:0})} €</td>
                <td>0.15 €/kg</td>
                <td><span class="badge-status-table ${statusClass}">${l.status}</span></td>
            </tr>
        `;
    }).join('');
}

function renderHR() {
    const hr = JSON.parse(localStorage.getItem("agrico_hr")) || DEFAULT_HR;
    const tbody = document.querySelector("#hr-table tbody");
    if (!tbody) return;
    tbody.innerHTML = hr.map(h => `
        <tr>
            <td><strong>${h.name}</strong></td>
            <td>${h.role}</td>
            <td>${h.rate.toFixed(2)} €/h</td>
            <td>${h.hours} h</td>
            <td style="font-weight:600;">${h.salary}</td>
            <td><span class="badge-status-table ${h.status === 'Validé' ? 'status-completed' : 'status-processing'}">${h.status}</span></td>
        </tr>
    `).join('');
}

function renderCosts(lots) {
    const tbody = document.querySelector("#costs-summary-table tbody");
    if (!tbody) return;
    tbody.innerHTML = lots.map(l => {
        const rawCost = l.weight * l.purchasePrice;
        const wasteWeight = l.weight * ((100 - l.yield) / 100);
        const wasteCost = wasteWeight * l.purchasePrice;
        const processCost = (l.weight * l.packingCost) + (l.laborHours * 15);
        const logCost = (l.weight * (l.yield / 100)) * l.freightCost;
        
        const energyCost = (l.weight * (l.yield / 100)) * 0.05;
        const totalLotCost = rawCost + processCost + logCost + energyCost;
        const realCostPerKg = totalLotCost / (l.weight * (l.yield / 100));
        const profit = totalLotCost * 0.18;
        
        return `
            <tr>
                <td style="font-weight:700;">${l.code}</td>
                <td>${rawCost.toLocaleString('fr-FR', {maximumFractionDigits:0})} €</td>
                <td style="color:var(--danger);">${wasteCost.toLocaleString('fr-FR', {maximumFractionDigits:0})} €</td>
                <td>${processCost.toLocaleString('fr-FR', {maximumFractionDigits:0})} €</td>
                <td>${(logCost + energyCost).toLocaleString('fr-FR', {maximumFractionDigits:0})} €</td>
                <td style="font-weight:800; color:var(--primary);">${realCostPerKg.toFixed(2)} €/kg</td>
                <td style="font-weight:700; color:#1e40af;">+${profit.toLocaleString('fr-FR', {maximumFractionDigits:0})} €</td>
            </tr>
        `;
    }).join('');
}

// Boîte de dialogue et création de lot
function initModalEvents() {
    const modal = document.getElementById("modal-lot");
    const btnNewLot = document.getElementById("btn-new-lot");
    const btnCloseModal = document.getElementById("btn-close-modal");
    const btnCancelModal = document.getElementById("btn-cancel-modal");
    const formNewLot = document.getElementById("form-new-lot");

    if (btnNewLot) btnNewLot.addEventListener("click", () => modal.classList.add("active"));
    
    const closeModal = () => modal.classList.remove("active");
    if (btnCloseModal) btnCloseModal.addEventListener("click", closeModal);
    if (btnCancelModal) btnCancelModal.addEventListener("click", closeModal);

    if (formNewLot) {
        formNewLot.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const product = document.getElementById("lot-product").value;
            const weight = parseFloat(document.getElementById("lot-weight").value);
            const purchasePrice = parseFloat(document.getElementById("lot-price").value);
            const supplier = document.getElementById("lot-supplier").value;

            const lots = getLots();
            const codeNum = Math.floor(1000 + Math.random() * 9000);
            const newLot = {
                code: `L-${codeNum}`,
                date: new Date().toISOString().split('T')[0],
                product: product,
                supplier: supplier,
                weight: weight,
                yield: 80,
                purchasePrice: purchasePrice,
                costPrice: purchasePrice + 1.03, // Coût estimé incluant énergie + consommable
                status: "En cours",
                destination: "Europe (Fret)",
                packingCost: 0.38,
                laborHours: Math.round(weight / 250),
                freightCost: 0.75
            };

            lots.unshift(newLot);
            saveLots(lots);
            addLog("success", `Nouveau lot ${newLot.code} (${product}) réceptionné de ${supplier}.`);
            
            renderAllData();
            closeModal();
            formNewLot.reset();

            // Mettre à jour le simulateur
            document.getElementById('sim-input-weight').value = weight;
            document.getElementById('sim-purchase-price').value = purchasePrice;
            updateSimulation();
        });
    }
}
