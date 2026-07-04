// Initialisation des icônes Lucide
document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();
    initCharts();
    initSimulator();
    renderBatchesTable();
    initModalEvents();
});

// Données Simulées pour l'ERP (Lots exports récents)
let batchesData = [
    { code: "L-2607A", product: "Tomate Cerise", weight: 8000, yield: 82, costPrice: 1.84, status: "Terminé" },
    { code: "L-2607B", product: "Haricot Vert", weight: 6500, yield: 75, costPrice: 2.15, status: "En cours" },
    { code: "L-2608A", product: "Agrumes (Clémentines)", weight: 12000, yield: 88, costPrice: 1.62, status: "Terminé" },
    { code: "L-2608B", product: "Tomate Cerise", weight: 9500, yield: 79, costPrice: 1.95, status: "En cours" }
];

// Graphiques globaux
let costChart = null;
let wasteChart = null;

// Initialisation des graphiques Chart.js
function initCharts() {
    // 1. Chart Breakdown Cost (Barres empilées / Horizontales)
    const ctxCost = document.getElementById('costBreakdownChart').getContext('2d');
    costChart = new Chart(ctxCost, {
        type: 'bar',
        data: {
            labels: ['Structure de coût (€/Kg exporté)'],
            datasets: [
                { label: 'Achat Matière', data: [0.80], backgroundColor: '#10b981' },
                { label: 'Écart de Tri', data: [0.20], backgroundColor: '#ef4444' },
                { label: 'Emballage', data: [0.38], backgroundColor: '#3b82f6' },
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

    // 2. Chart répartition Écart de Tri (Camembert)
    const ctxWaste = document.getElementById('wasteDistributionChart').getContext('2d');
    wasteChart = new Chart(ctxWaste, {
        type: 'doughnut',
        data: {
            labels: ['Rebuts / Déchets', 'Vente Locale (2ème choix)', 'Pertes Manipulation'],
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

// Logique du simulateur
function initSimulator() {
    const inputs = [
        'sim-input-weight', 'sim-purchase-price', 'sim-waste-rate',
        'sim-packing-cost', 'sim-labor-cost', 'sim-freight-cost'
    ];

    inputs.forEach(id => {
        document.getElementById(id).addEventListener('input', updateSimulation);
    });
    
    // Initial calculation
    updateSimulation();
}

function updateSimulation() {
    const rawWeight = parseFloat(document.getElementById('sim-input-weight').value) || 0;
    const purchasePrice = parseFloat(document.getElementById('sim-purchase-price').value) || 0;
    const wasteRate = parseFloat(document.getElementById('sim-waste-rate').value) || 0;
    const packingCost = parseFloat(document.getElementById('sim-packing-cost').value) || 0;
    const laborHourly = parseFloat(document.getElementById('sim-labor-cost').value) || 0;
    const freightCost = parseFloat(document.getElementById('sim-freight-cost').value) || 0;

    // Update waste rate slider text
    document.getElementById('waste-val').innerText = `${wasteRate}%`;

    // Calculs de rendement
    const yieldRate = 100 - wasteRate;
    const exportWeight = rawWeight * (yieldRate / 100);

    // Calculs de coûts financiers
    const totalPurchaseCost = rawWeight * purchasePrice;
    
    // Impact de la perte de tri sur le coût matière :
    // Le coût de la matière exportée = coût achat total / poids exporté
    const rawMaterialCostPerKgExport = exportWeight > 0 ? (totalPurchaseCost / exportWeight) : 0;
    const wasteCostPerKgExport = rawMaterialCostPerKgExport - purchasePrice; // le surcoût dû au tri

    // Main d'œuvre estimée : Disons 1h pour 250 kg brut
    const estimatedHours = rawWeight / 250;
    const totalLaborCost = estimatedHours * laborHourly;
    const laborCostPerKgExport = exportWeight > 0 ? (totalLaborCost / exportWeight) : 0;

    // Fret, logistique et emballage s'appliquent sur le produit emballé
    const totalPackingCost = exportWeight * packingCost;
    const totalFreightCost = exportWeight * freightCost;

    const totalLotCost = totalPurchaseCost + totalLaborCost + totalPackingCost + totalFreightCost;
    const totalCostPerKgExport = exportWeight > 0 ? (totalLotCost / exportWeight) : 0;

    // Update UI
    document.getElementById('res-export-weight').innerText = `${exportWeight.toLocaleString('fr-FR')} kg`;
    document.getElementById('res-yield').innerText = `${yieldRate}%`;
    document.getElementById('res-total-cost-kg').innerText = `${totalCostPerKgExport.toFixed(2)} €/kg`;
    document.getElementById('res-total-lot-cost').innerText = `${totalLotCost.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

    // Update Chart
    if (costChart) {
        costChart.data.datasets[0].data = [purchasePrice];
        costChart.data.datasets[1].data = [wasteCostPerKgExport];
        costChart.data.datasets[2].data = [packingCost + laborCostPerKgExport];
        costChart.data.datasets[3].data = [freightCost];
        costChart.options.scales.x.max = Math.ceil(totalCostPerKgExport + 0.5);
        costChart.update();
    }
}

// Rendu du tableau des lots
function renderBatchesTable() {
    const tbody = document.querySelector("#batches-table tbody");
    tbody.innerHTML = "";

    batchesData.forEach(batch => {
        const tr = document.createElement("tr");
        const statusClass = batch.status === "Terminé" ? "status-completed" : "status-processing";
        
        tr.innerHTML = `
            <td style="font-weight: 600; color: #1e293b;">${batch.code}</td>
            <td>${batch.product}</td>
            <td>${batch.weight.toLocaleString('fr-FR')} kg</td>
            <td><span style="font-weight: 600; color: var(--primary);">${batch.yield}%</span></td>
            <td><strong>${batch.costPrice.toFixed(2)} €/kg</strong></td>
            <td><span class="badge-status-table ${statusClass}">${batch.status}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

// Modals Events
function initModalEvents() {
    const modal = document.getElementById("modal-lot");
    const btnNewLot = document.getElementById("btn-new-lot");
    const btnCloseModal = document.getElementById("btn-close-modal");
    const btnCancelModal = document.getElementById("btn-cancel-modal");
    const formNewLot = document.getElementById("form-new-lot");

    btnNewLot.addEventListener("click", () => modal.classList.add("active"));
    
    const closeModal = () => modal.classList.remove("active");
    btnCloseModal.addEventListener("click", closeModal);
    btnCancelModal.addEventListener("click", closeModal);

    formNewLot.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const product = document.getElementById("lot-product").value;
        const weight = parseFloat(document.getElementById("lot-weight").value);
        const purchasePrice = parseFloat(document.getElementById("lot-price").value);

        // Simulation d'un code lot unique
        const codeNum = Math.floor(1000 + Math.random() * 9000);
        const newBatch = {
            code: `L-${codeNum}`,
            product: product,
            weight: weight,
            yield: 80, // valeur estimée par défaut
            costPrice: purchasePrice + 0.95, // valeur estimée de conditionnement
            status: "En cours"
        };

        batchesData.unshift(newBatch);
        renderBatchesTable();
        closeModal();
        formNewLot.reset();
        
        // Mettre à jour le simulateur avec les valeurs saisies
        document.getElementById('sim-input-weight').value = weight;
        document.getElementById('sim-purchase-price').value = purchasePrice;
        updateSimulation();
    });
}
