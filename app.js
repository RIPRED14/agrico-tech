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

// Produits modèles Cigar Box (Standards ITC)
const CIGAR_BOX_PRODUCTS = {
    pomme: {
        name: "Jus de Pomme Concentré 70 Brix",
        prices: { C_F: 1200, EXW: 772, RM: 45 },
        pr: { artisan: 11.0, "semi-industrial": 8.0, industrial: 6.0 },
        vc: { vc1: 460, vc2: 58, vc3: 92, vc4: 236 },
        fc: 446200
    },
    mangue: {
        name: "Purée de Mangue 28 Brix (Double Force)",
        prices: { C_F: 1000, EXW: 544, RM: 100 },
        pr: { artisan: 3.5, "semi-industrial": 2.86, industrial: 2.2 },
        vc: { vc1: 286, vc2: 23, vc3: 85, vc4: 280 },
        fc: 211943
    },
    jus: {
        name: "Jus de Fruits (100% à base de concentré)",
        prices: { C_F: 985, EXW: 746, RM: 600 },
        pr: { artisan: 0.45, "semi-industrial": 0.38, industrial: 0.30 },
        vc: { vc1: 305, vc2: 72, vc3: 122, vc4: 75 },
        fc: 1037600
    },
    noyer: {
        name: "Conserves de Noyer Vert Bio",
        prices: { C_F: 4980, EXW: 3568, RM: 883 },
        pr: { artisan: 0.70, "semi-industrial": 0.59, industrial: 0.48 },
        vc: { vc1: 799, vc2: 162, vc3: 405, vc4: 582 },
        fc: 742400
    },
    pois: {
        name: "Petits Pois en Conserve 340ml",
        prices: { C_F: 400, EXW: 283, RM: 190 },
        pr: { artisan: 0.95, "semi-industrial": 0.80, industrial: 0.68 },
        vc: { vc1: 175, vc2: 30, vc3: 40, vc4: 50 },
        fc: 490000
    },
    surgeles: {
        name: "Mélange de Maïs et Pois Doux Congelés (IQF)",
        prices: { C_F: 1000, EXW: 783, RM: 280 },
        pr: { artisan: 1.55, "semi-industrial": 1.30, industrial: 1.10 },
        vc: { vc1: 385, vc2: 96, vc3: 100, vc4: 50 },
        fc: 466000
    }
};

// Structure par défaut de la base de données
const DEFAULT_LOTS = [
    { code: "L-2607A", date: "2026-07-01", product: "Tomate Cerise", supplier: "Coop Souss", weight: 8000, yield: 82, purchasePrice: 0.80, costPrice: 1.84, status: "Terminé", destination: "France (Rungis)", packingCost: 0.38, laborHours: 32, freightCost: 0.75, step: 6 },
    { code: "L-2607B", date: "2026-07-02", product: "Haricot Vert", supplier: "AgroAtlas", weight: 6500, yield: 75, purchasePrice: 0.95, costPrice: 2.15, status: "En cours", destination: "Allemagne (Munich)", packingCost: 0.42, laborHours: 28, freightCost: 0.85, step: 3 },
    { code: "L-2608A", date: "2026-07-03", product: "Agrumes (Clémentines)", supplier: "Clémentines du Sud", weight: 12000, yield: 88, purchasePrice: 0.70, costPrice: 1.62, status: "Terminé", destination: "Espagne (Barcelone)", packingCost: 0.35, laborHours: 40, freightCost: 0.70, step: 5 }
];

const DEFAULT_LOGS = [
    { type: "info", time: "08:12:04", msg: "Démarrage de la station de conditionnement. Ligne A et B actives." },
    { type: "success", time: "08:14:25", msg: "Arrivage Lot L-2608A validé. Qualité agréage : A (Excellent)." },
    { type: "warning", time: "09:30:11", msg: "Alerte : Température frigo 2 détectée à 6°C (Cible < 4°C). Correction automatique activée." },
    { type: "info", time: "10:15:00", msg: "Expédition du Lot L-2607A vers Rungis, France (Conteneur RF-8842)." }
];

const DEFAULT_CONSOMMABLES = [
    { name: "Cartons Export 5Kg (VC3)", usage: "Colisage principal", cost: 0.25, stock: 12400, status: "Optimal" },
    { name: "Palettes Europe (Bois) (VC3)", usage: "Palettisation", cost: 12.00, stock: 450, status: "Optimal" },
    { name: "Barquettes Plastiques 250g (VC3)", usage: "Conditionnement unitaire", cost: 0.08, stock: 42000, status: "Optimal" },
    { name: "Cornières & Films (VC3)", usage: "Fardelage", cost: 0.05, stock: 1500, status: "Seuil Bas" }
];

const DEFAULT_TRAITEMENTS = [
    { name: "Cire de carnauba (Citrosol) (VC1)", usage: "Enrobage agrumes", dosage: "1.2 L / Tonne", cost: 6.50 },
    { name: "Fludioxonil (Fongicide) (VC1)", usage: "Traitement post-récolte", dosage: "300 ml / 100 L", cost: 45.00 },
    { name: "Solution assainissante (VC1)", usage: "Désinfection eau lavage", dosage: "50 ppm", cost: 2.20 }
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
        dashboard: { title: "Tableau de bord CIGAR BOX", subtitle: "Modélisation des coûts et seuils de rentabilité ITC pour l'exportation européenne" },
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
            labels: ['Structure de coût (USD/Tonne exporté)'],
            datasets: [
                { label: 'VC1 (Matières & Ingrédients)', data: [286], backgroundColor: '#10b981' },
                { label: 'VC2 (Transformation / Main d\'oeuvre)', data: [23], backgroundColor: '#3b82f6' },
                { label: 'VC3 (Emballages)', data: [85], backgroundColor: '#a855f7' },
                { label: 'VC4 (Livraison / Fret)', data: [280], backgroundColor: '#f97316' }
            ]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { stacked: true, max: 1200 },
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
            margins: [
                { label: 'Jus Concentré Pomme', data: [18, 22, 20, 24, 25, 23], borderColor: '#10b981', tension: 0.2, fill: false },
                { label: 'Purée de Mangue', data: [25, 27, 28, 26, 29, 27], borderColor: '#3b82f6', tension: 0.2, fill: false },
                { label: 'Petit Pois Conserve', data: [4, 5, 5, 6, 7, 5], borderColor: '#f97316', tension: 0.2, fill: false }
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
            labels: ['VC1 (Matière)', 'VC2 (Transformation)', 'VC3 (Emballages)', 'VC4 (Logistique Fret)'],
            datasets: [{
                data: [450, 120, 180, 250],
                backgroundColor: ['#10b981', '#3b82f6', '#a855f7', '#f97316']
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

// Simulateur de Coût de Revient Cigar Box (ITC)
function initSimulator() {
    const ids = ['cb-product-select', 'cb-tech-select', 'cb-selling-price', 'cb-rm-price', 'cb-fixed-costs', 'cb-qty-sold'];
    ids.forEach(id => {
        document.getElementById(id).addEventListener('change', updateSimulation);
        document.getElementById(id).addEventListener('input', updateSimulation);
    });

    // Événement de changement de produit
    document.getElementById('cb-product-select').addEventListener('change', (e) => {
        const prodKey = e.target.value;
        const config = CIGAR_BOX_PRODUCTS[prodKey];
        if (config) {
            document.getElementById('cb-selling-price').value = config.prices.C_F;
            document.getElementById('cb-rm-price').value = config.prices.RM;
            document.getElementById('cb-fixed-costs').value = config.fc;
        }
    });

    updateSimulation();
}

function updateSimulation() {
    const prodKey = document.getElementById('cb-product-select').value;
    const techLevel = document.getElementById('cb-tech-select').value;
    const cfPrice = parseFloat(document.getElementById('cb-selling-price').value) || 0;
    const rmPrice = parseFloat(document.getElementById('cb-rm-price').value) || 0;
    const fc = parseFloat(document.getElementById('cb-fixed-costs').value) || 0;
    const qtySold = parseFloat(document.getElementById('cb-qty-sold').value) || 0;

    const config = CIGAR_BOX_PRODUCTS[prodKey];
    if (!config) return;

    // Récupérer le ratio de traitement (PR) selon la technologie
    const pr = config.pr[techLevel];
    document.getElementById('res-cb-pr').innerText = `${pr.toFixed(2)} kg/kg`;

    // Calculs de coûts variables
    const vc1 = rmPrice * pr; // Coût réel de matière première pondéré par le rendement
    const vc2 = config.vc.vc2;
    const vc3 = config.vc.vc3;
    const vc4 = config.vc.vc4;

    const exwPrice = cfPrice - vc4; // Prix EX Works
    const totalVC = vc1 + vc2 + vc3;
    const margin = exwPrice - totalVC;
    const marginPct = exwPrice > 0 ? (margin / exwPrice) * 100 : 0;

    // Calculs de seuils de rentabilité (Break-Even)
    const beQtySales = margin > 0 ? (fc / margin) : 0;
    const beQtyRM = beQtySales * pr;

    // Résultat financier net
    const contribution = margin * qtySold;
    const netProfit = contribution - fc;

    // Mise à jour de l'interface
    document.getElementById('res-cb-margin-pct').innerText = `${marginPct.toFixed(1)}%`;
    document.getElementById('res-cb-be-sales').innerText = `${Math.round(beQtySales).toLocaleString('fr-FR')} Tonnes`;
    document.getElementById('res-cb-be-rm').innerText = `${Math.round(beQtyRM).toLocaleString('fr-FR')} Tonnes`;
    
    const profitEl = document.getElementById('res-cb-net-profit');
    if (netProfit >= 0) {
        profitEl.innerText = `+${netProfit.toLocaleString('fr-FR', {minimumFractionDigits: 2, maximumFractionDigits: 2})} USD`;
        profitEl.style.color = "#166534";
    } else {
        profitEl.innerText = `${netProfit.toLocaleString('fr-FR', {minimumFractionDigits: 2, maximumFractionDigits: 2})} USD`;
        profitEl.style.color = "#991b1b";
    }

    // Mise à jour du graphique horizontal
    if (costChart) {
        costChart.data.datasets[0].data = [vc1];
        costChart.data.datasets[1].data = [vc2];
        costChart.data.datasets[2].data = [vc3];
        costChart.data.datasets[3].data = [vc4];
        costChart.options.scales.x.max = Math.ceil(cfPrice + 200);
        costChart.update();
    }
}

// Calculs d'Énergie et Consignes Chambres Froides
let frigoConsignes = { frigo1: 4, frigo2: 2, frigo3: 8 };

function initEnergyCalculations() {
    const inputs = ['consigne-1', 'consigne-2', 'consigne-3', 'kwh-price'];
    inputs.forEach(id => {
        if (document.getElementById(id)) {
            document.getElementById(id).addEventListener('input', calculateEnergyCosts);
        }
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
            addLog("success", "IA OCR : Manuel de transformation ITC Cigar Box indexé.");
            
            const chatBody = document.getElementById('ai-chat-body');
            chatBody.innerHTML += `
                <div class="ai-msg user-msg bg-slate-100 p-3 rounded-lg max-w-[80%] self-end">
                    [Fichier Booklet-1-ITC-FV-Processing.pdf scanné]
                </div>
                <div class="ai-msg bot-msg bg-emerald-50 text-emerald-800 border border-emerald-100 p-3 rounded-lg max-w-[80%] self-start">
                    J'ai extrait les règles financières du livret ITC. Ratios de traitement (PR) et coûts variables (VC1, VC2, VC3, VC4) intégrés au système pour le calcul des marges.
                </div>
            `;
            chatBody.scrollTop = chatBody.scrollHeight;
        });
    }

    if (btnGenerate) {
        btnGenerate.addEventListener('click', () => {
            const period = selectPeriod.value;
            reportOutput.classList.remove('hidden');
            
            const lots = getLots();
            const hr = JSON.parse(localStorage.getItem("agrico_hr")) || DEFAULT_HR;
            const cons = JSON.parse(localStorage.getItem("agrico_consommables")) || DEFAULT_CONSOMMABLES;
            const suppliers = JSON.parse(localStorage.getItem("agrico_fournisseurs")) || DEFAULT_FOURNISSEURS;

            // Compilation dynamique pour le responsable de contrôle de gestion
            const totalBrut = lots.reduce((sum, l) => sum + l.weight, 0);
            const avgYield = lots.reduce((sum, l) => sum + l.yield, 0) / lots.length;
            const totalExport = lots.reduce((sum, l) => sum + (l.weight * (l.yield / 100)), 0);
            
            const totalHoursPlan = hr.reduce((sum, h) => sum + h.hours, 0);
            const totalSalary = hr.reduce((sum, h) => sum + (h.rate * h.hours), 0);
            const avgLaborRate = totalExport > 0 ? (totalSalary / totalExport) : 0;
            
            // Énergie
            const c1 = parseFloat(document.getElementById('consigne-1').value) || 4;
            const c2 = parseFloat(document.getElementById('consigne-2').value) || 2;
            const c3 = parseFloat(document.getElementById('consigne-3').value) || 8;
            const priceKWh = parseFloat(document.getElementById('kwh-price').value) || 0.18;
            const kwhTotal = ((14.5 * (35 - c1) * 0.08) + (28.0 * (35 - c2) * 0.08) + (8.2 * (35 - c3) * 0.08)) * 30;
            const costEnergy = kwhTotal * priceKWh;

            const titles = {
                jour: "RAPPORT DE CONTRÔLE DE GESTION JOURNALIER (IA)",
                semaine: "RAPPORT DE CONTRÔLE DE GESTION HEBDOMADAIRE (IA)",
                mois: "RAPPORT DE CONTRÔLE DE GESTION MENSUEL (IA)",
                trimestre: "RAPPORT DE CONTRÔLE DE GESTION TRIMESTRIEL (IA)"
            };

            let reportBody = `
                <strong>1. RESSOURCES HUMAINES & MASSE SALARIALE LIGNE :</strong><br>
                - Effectifs actifs de station : <strong>${hr.length} collaborateurs</strong> (1 chef de ligne, opérateurs, caristes).<br>
                - Masse salariale de la période : <strong>${totalSalary.toLocaleString('fr-FR')} EUR</strong> pour un cumul de <strong>${totalHoursPlan} heures</strong> travaillées.<br>
                - Ratio de productivité : <strong>${(totalExport / totalHoursPlan).toFixed(1)} kg exportés / heure-homme</strong>.<br>
                - Coût unitaire de Main d'Œuvre Directe : <strong>${avgLaborRate.toFixed(2)} € / kg exporté</strong>.<br><br>

                <strong>2. ÉNERGIE & CHAMBRES FROIDES (ULO) :</strong><br>
                - Consignes thermiques appliquées : Frigo 1 (Brut) = <strong>${c1}°C</strong> | Frigo 2 (Export) = <strong>${c2}°C</strong> | Frigo 3 (Local) = <strong>${c3}°C</strong>.<br>
                - Consommation électrique calculée : <strong>${Math.round(kwhTotal).toLocaleString('fr-FR')} KWh</strong>.<br>
                - Impact financier énergie : <strong>${costEnergy.toLocaleString('fr-FR', {minimumFractionDigits:2, maximumFractionDigits:2})} EUR</strong> (soit <strong>${(costEnergy / totalExport).toFixed(3)} € / kg exporté</strong>).<br><br>

                <strong>3. INTRANTS DE CONDITIONNEMENT & EMBALLAGES (VC3) :</strong><br>
                - Stock restant de cartons d'exportation : <strong>${cons[0].stock.toLocaleString('fr-FR')} unités</strong>.<br>
                - Alerte approvisionnement : Le consommable <strong>"${cons[3].name}"</strong> est en seuil bas (<strong>${cons[3].stock} restants</strong>).<br>
                - Coût moyen d'emballage unitaire : <strong>${cons[0].cost.toFixed(2)} € / colis</strong>.<br><br>

                <strong>4. ACHATS & QUALITÉ AGRÉAGE FOURNISSEURS :</strong><br>
                - Volume total brut réceptionné : <strong>${totalBrut.toLocaleString('fr-FR')} kg</strong>.<br>
                - Rendement moyen de conditionnement (Pack-out) : <strong>${avgYield.toFixed(1)}%</strong>.<br>
                - Fournisseur le plus performant : <strong>${suppliers[2].name}</strong> (Taux de rebut minimal : <strong>${suppliers[2].waste}</strong>).<br>
                - Alerte Qualité / Perte : Le lot fourni par <strong>${suppliers[1].name}</strong> présente un taux d'écart élevé de <strong>${suppliers[1].waste}</strong>.<br><br>

                <strong>5. BILAN FINANCIER & PERFORMANCE EXPORT :</strong><br>
                - Volume total expédié vers l'UE : <strong>${Math.round(totalExport).toLocaleString('fr-FR')} kg net</strong>.<br>
                - Marge d'exploitation consolidée estimée : <strong>31.4%</strong> (Statut : <strong>Robuste</strong>).
            `;

            reportTitle.innerHTML = titles[period];
            reportText.innerHTML = reportBody;
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

    // Convertir de manière représentative pour la marge Cigar Box
    document.getElementById('kpi-yield').innerText = "31.4%";
    document.getElementById('kpi-packing').innerText = `${avgPacking.toFixed(2)} €/colis`;
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

const WORKFLOW_STEPS = [
    { step: 1, label: "Réception & Agréage", desc: "Agréage qualitatif et pesée brute de l'apport." },
    { step: 2, label: "Lavage & Nettoyage", desc: "Lavage à l'eau assainissante et traitement fongicide." },
    { step: 3, label: "Tri & Calibrage", desc: "Élimination des écarts de tri et calibrage mécanique." },
    { step: 4, label: "Conditionnement / Plastique", desc: "Mise en barquettes plastiques, flowpack et colisage." },
    { step: 5, label: "Mise en Chambre Froide", desc: "Maintien de la chaîne du froid dans les frigos." },
    { step: 6, label: "Expédition Export", desc: "Mise en conteneur réfrigéré et export vers l'Europe." }
];

let activeSelectedLotCode = "L-2607B"; // Lot par défaut

function renderReceptions(lots) {
    const tbody = document.querySelector("#receptions-table tbody");
    if (!tbody) return;
    
    tbody.innerHTML = lots.map(l => {
        const stepInfo = WORKFLOW_STEPS.find(s => s.step === (l.step || 1));
        const activeClass = l.code === activeSelectedLotCode ? 'style="background-color: var(--primary-light); cursor:pointer;"' : 'style="cursor:pointer;"';
        return `
            <tr ${activeClass} onclick="selectLotForWorkflow('${l.code}')">
                <td style="font-weight:700;">${l.code}</td>
                <td>${l.date}</td>
                <td>${l.product}</td>
                <td>${l.supplier}</td>
                <td>${l.weight.toLocaleString('fr-FR')} kg</td>
                <td><span class="badge-status-table status-processing">${stepInfo.label}</span></td>
                <td><span class="badge-status-table status-completed">Agréé A</span></td>
            </tr>
        `;
    }).join('');

    renderWorkflowVisualizer(lots);
}

function selectLotForWorkflow(code) {
    activeSelectedLotCode = code;
    const lots = getLots();
    renderReceptions(lots);
}

function renderWorkflowVisualizer(lots) {
    const visualizer = document.getElementById("workflow-visualizer");
    const nextBtn = document.getElementById("btn-next-step");
    const statusText = document.getElementById("workflow-status-text");
    if (!visualizer) return;

    const lot = lots.find(l => l.code === activeSelectedLotCode);
    if (!lot) {
        visualizer.innerHTML = "";
        if (nextBtn) nextBtn.disabled = true;
        return;
    }

    const currentStep = lot.step || 1;

    visualizer.innerHTML = WORKFLOW_STEPS.map(s => {
        let stateClass = "";
        if (s.step === currentStep) stateClass = "active";
        else if (s.step < currentStep) stateClass = "completed";
        return `
            <div class="step-item ${stateClass}" onclick="setLotStep('${lot.code}', ${s.step})">
                <div class="step-circle">${s.step === currentStep ? '✓' : s.step}</div>
                <div class="step-label">${s.label}</div>
            </div>
        `;
    }).join('');

    const currentStepInfo = WORKFLOW_STEPS.find(s => s.step === currentStep);
    statusText.innerHTML = `Lot sélectionné : <strong>${lot.code} (${lot.product})</strong> | Étape : <strong>${currentStepInfo.label}</strong> - <em>${currentStepInfo.desc}</em>`;

    if (nextBtn) {
        nextBtn.disabled = currentStep >= 6;
        nextBtn.onclick = () => {
            if (currentStep < 6) {
                setLotStep(lot.code, currentStep + 1);
            }
        };
    }
}

function setLotStep(code, stepNum) {
    const lots = getLots();
    const lot = lots.find(l => l.code === code);
    if (lot) {
        lot.step = stepNum;
        
        // Logs d'activités automatiques de station
        const stepLabels = ["réceptionné", "lavé & désinfecté", "trié (écart de tri validé)", "conditionné sous plastique", "placé en chambre froide", "expédié vers l'Europe"];
        addLog("info", `Lot ${lot.code} (${lot.product}) : ${stepLabels[stepNum - 1]}.`);
        
        saveLots(lots);
        renderAllData();
    }
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
        const vc1 = l.weight * l.purchasePrice; // Matière brute
        const wasteWeight = l.weight * ((100 - l.yield) / 100);
        const wasteCost = wasteWeight * l.purchasePrice; // Pertes (écart de tri)
        const vc2 = l.laborHours * 15; // Coût main d'oeuvre variable
        const vc3 = l.weight * l.packingCost; // Emballages
        const vc4 = (l.weight * (l.yield / 100)) * l.freightCost; // Livraison
        
        const totalLotCost = vc1 + vc2 + vc3 + vc4;
        const realCostPerKg = totalLotCost / (l.weight * (l.yield / 100));
        const profit = totalLotCost * 0.18;
        
        return `
            <tr>
                <td style="font-weight:700;">${l.code}</td>
                <td>${vc1.toLocaleString('fr-FR', {maximumFractionDigits:0})} €</td>
                <td>${vc2.toLocaleString('fr-FR', {maximumFractionDigits:0})} €</td>
                <td>${vc3.toLocaleString('fr-FR', {maximumFractionDigits:0})} €</td>
                <td>${vc4.toLocaleString('fr-FR', {maximumFractionDigits:0})} €</td>
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
            document.getElementById('cb-product-select').value = "mangue";
            updateSimulation();
        });
    }
}
