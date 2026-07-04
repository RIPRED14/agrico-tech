// Initialisation de l'application
document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();
    initDB();
    initNavigation();
    initCharts();
    initSimulator();
    renderAllData();
    initModalEvents();
});

// structure par défaut de la base de données
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

function initDB() {
    if (!localStorage.getItem("agrico_lots")) {
        localStorage.setItem("agrico_lots", JSON.stringify(DEFAULT_LOTS));
    }
    if (!localStorage.getItem("agrico_logs")) {
        localStorage.setItem("agrico_logs", JSON.stringify(DEFAULT_LOGS));
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
        tri: { title: "Suivi des Lignes de Tri", subtitle: "Rendements de tri, pack-out rate et contrôle des rebuts" },
        expeditions: { title: "Expéditions d'Export", subtitle: "Suivi logistique et fret maritime / routier vers l'Europe" },
        costs: { title: "Calcul des Coûts de Revient", subtitle: "Analyse globale de rentabilité financière et marge par lot" }
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

            // Update titles
            pageTitle.textContent = tabMeta[targetTab].title;
            pageSubtitle.textContent = tabMeta[targetTab].subtitle;

            // Rerender specific views
            renderAllData();
        });
    });
}

// Graphiques Globaux
let costChart = null;
let wasteChart = null;

function initCharts() {
    const ctxCost = document.getElementById('costBreakdownChart').getContext('2d');
    costChart = new Chart(ctxCost, {
        type: 'bar',
        data: {
            labels: ['Structure de coût (€/Kg exporté)'],
            datasets: [
                { label: 'Achat Matière', data: [0.80], backgroundColor: '#10b981' },
                { label: 'Écart de Tri', data: [0.20], backgroundColor: '#ef4444' },
                { label: 'Emballage & MO', data: [0.44], backgroundColor: '#3b82f6' },
                { label: 'Fret & Logistique', data: [0.75], backgroundColor: '#a855f7' }
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

// Rendu des Données dans les Tableaux
function renderAllData() {
    const lots = getLots();
    updateKPIs(lots);
    renderLogs();
    renderReceptions(lots);
    renderTri(lots);
    renderExpeditions(lots);
    renderCosts(lots);
}

function updateKPIs(lots) {
    if (lots.length === 0) return;
    const avgYield = lots.reduce((sum, l) => sum + l.yield, 0) / lots.length;
    const avgPacking = lots.reduce((sum, l) => sum + l.packingCost, 0) / lots.length;
    const avgFreight = lots.reduce((sum, l) => sum + l.freightCost, 0) / lots.length;
    const avgCost = lots.reduce((sum, l) => sum + l.costPrice, 0) / lots.length;

    document.getElementById('kpi-yield').innerText = `${avgYield.toFixed(1)}%`;
    document.getElementById('kpi-packing').innerText = `${avgPacking.toFixed(2)} €/kg`;
    document.getElementById('kpi-logistics').innerText = `${avgFreight.toFixed(2)} €/kg`;
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

function renderCosts(lots) {
    const tbody = document.querySelector("#costs-summary-table tbody");
    if (!tbody) return;
    tbody.innerHTML = lots.map(l => {
        const rawCost = l.weight * l.purchasePrice;
        const wasteWeight = l.weight * ((100 - l.yield) / 100);
        const wasteCost = wasteWeight * l.purchasePrice;
        const processCost = (l.weight * l.packingCost) + (l.laborHours * 15);
        const logCost = (l.weight * (l.yield / 100)) * l.freightCost;
        const profit = (rawCost + processCost + logCost) * 0.18; // 18% Marge estimée
        
        return `
            <tr>
                <td style="font-weight:700;">${l.code}</td>
                <td>${rawCost.toLocaleString('fr-FR', {maximumFractionDigits:0})} €</td>
                <td style="color:var(--danger);">${wasteCost.toLocaleString('fr-FR', {maximumFractionDigits:0})} €</td>
                <td>${processCost.toLocaleString('fr-FR', {maximumFractionDigits:0})} €</td>
                <td>${logCost.toLocaleString('fr-FR', {maximumFractionDigits:0})} €</td>
                <td style="font-weight:800; color:var(--primary);">${l.costPrice.toFixed(2)} €/kg</td>
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
                costPrice: purchasePrice + 0.98, // Coût estimé
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
