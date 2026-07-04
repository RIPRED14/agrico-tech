// REDA'S B2B ERP HUB - APPLICATION SCRIPT

document.addEventListener('DOMContentLoaded', () => {
  
  // ==========================================
  // 1. UI CORE: NAVBAR, MOBILE MENU & SCROLL EFFECTS
  // ==========================================
  const header = document.getElementById('header');
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Change nav style on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    
    // Simple active link highlight based on scroll position
    const scrollPos = window.scrollY + 100;
    document.querySelectorAll('section').forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      
      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  });

  // Mobile Menu Toggle
  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
  });

  // Close mobile menu when clicking nav links
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });

  // ==========================================
  // 2. SCROLL ANIMATIONS (INTERSECTION OBSERVER)
  // ==========================================
  const animatedElements = document.querySelectorAll('.fade-in-up');
  const skillFills = document.querySelectorAll('.skill-fill');
  
  const appearanceObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('appear');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -50px 0px'
  });

  animatedElements.forEach(el => appearanceObserver.observe(el));

  // Trigger skill bar width animations when skill list enters viewport
  const skillsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        skillFills.forEach(fill => {
          const targetPercent = fill.getAttribute('data-percentage');
          fill.style.width = `${targetPercent}%`;
        });
      }
    });
  }, { threshold: 0.2 });

  const skillsListContainer = document.querySelector('.skills-list');
  if (skillsListContainer) {
    skillsObserver.observe(skillsListContainer);
  }

  // ==========================================
  // 3. INTERACTIVE CATEGORY FILTERING (DEMO HUB)
  // ==========================================
  const filterButtons = document.querySelectorAll('.filter-btn');
  const demoCards = document.querySelectorAll('.demo-card');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Set active tab styling
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const category = button.getAttribute('data-category');

      // Filter cards
      demoCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (category === 'all' || cardCategory === category) {
          card.classList.remove('hidden');
          // Trigger slight delay to re-trigger transition
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(() => {
            card.classList.add('hidden');
          }, 300);
        }
      });
    });
  });

  // ==========================================
  // 4. B2B CONTACT FORM HANDLING
  // ==========================================
  const contactForm = document.getElementById('b2b-contact-form');
  const contactSuccess = document.getElementById('form-success');
  const submitBtn = document.getElementById('btn-submit-contact');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Simulate form submission animation
      submitBtn.disabled = true;
      submitBtn.textContent = "Transmission en cours...";
      
      setTimeout(() => {
        contactForm.style.display = 'none';
        contactSuccess.style.display = 'block';
        
        // Reset form for later
        contactForm.reset();
      }, 1500);
    });
  }

  // ==========================================
  // 5. DEMO SIMULATOR STATE & GATING LOGIC
  // ==========================================
  const simModal = document.getElementById('sim-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalGate = document.getElementById('modal-gate');
  const gateForm = document.getElementById('gate-form');
  const launchButtons = document.querySelectorAll('.launch-demo-btn');
  const modalProjectTitle = document.getElementById('modal-project-title');
  const simSidebarButtons = document.querySelectorAll('.sim-sidebar-btn');
  const simContentArea = document.getElementById('sim-content-area');

  // Gating state variables
  let isUnlocked = localStorage.getItem('erp_demos_unlocked') === 'true';
  let firstDemoOpened = sessionStorage.getItem('first_demo_opened') || null;
  let activeProject = null;
  let activeTab = 'dashboard';

  // Simulator Data Objects
  const simulatorConfigs = {
    maritime: {
      title: "ELABBAR Suite v4.2 — Secteur Maritime",
      stats: [
        { label: "Volume Pêché", value: "14 280 kg", trend: "+12% aujourd'hui", isUp: true },
        { label: "Bateaux en Mer", value: "6 / 8", trend: "Flotte active", isUp: true },
        { label: "Temp. Criée", value: "-2.4 °C", trend: "Congélateur stable", isUp: true },
        { label: "Alertes Criée", value: "0", trend: "Opérations OK", isUp: true }
      ],
      interactiveLabel: "Générateur de QR Code de Traçabilité",
      logs: [
        "INFO  [08:12:04] Démarrage du système de tri automatique - Criée Port d'Agadir.",
        "INFO  [08:14:23] Authentification faciale : Capitaine Reda El-Abbar détecté.",
        "SUCCESS [08:14:25] Accès validé. Bateau ELABBAR-01 autorisé au débarquement.",
        "INFO  [08:20:11] Balance connectée criée #2 : Pesée reçue - 1,280kg de sardines.",
        "SUCCESS [08:20:13] Batch LOT-FISH-0026 généré avec QR code de traçabilité.",
        "INFO  [08:35:50] Télémétrie GPS reçue - ELABBAR-03 en transit à 12 nœuds."
      ]
    },
    pharma: {
      title: "PharmaTrack Pro — Conformité & Suivi",
      stats: [
        { label: "Lots Validés", value: "184", trend: "Conformité 100%", isUp: true },
        { label: "Temp. Chambre Froide", value: "4.2 °C", trend: "Consigne [2°C - 8°C]", isUp: true },
        { label: "Niveau Critique", value: "2", trend: "Réapprovisionnement auto", isUp: false },
        { label: "Capteurs Actifs", value: "18 / 18", trend: "Réseau maillé IoT", isUp: true }
      ],
      interactiveLabel: "Simulation d'Alerte Température IoT",
      logs: [
        "INFO  [09:00:00] Initialisation du protocole de conformité FDA 21 CFR Part 11.",
        "DEBUG [09:02:15] Lecture capteur IoT Temp-B3 : 4.15 °C. Statut : Conforme.",
        "INFO  [09:05:48] Sortie de lot : Lot PH-AMOX-887 transféré en zone d'emballage.",
        "DEBUG [09:12:00] Temp-B3 : 4.25 °C. Humidité relative : 44%.",
        "INFO  [09:15:22] Alerte automatique générée : Stock critique atteint sur Paracétamol 500mg.",
        "SUCCESS [09:15:24] Commande fournisseur #PH-7726 générée automatiquement."
      ]
    },
    rental: {
      title: "GT Location ERP — Gestion de Flotte",
      stats: [
        { label: "Véhicules Loués", value: "38 / 45", trend: "Taux: 84.4%", isUp: true },
        { label: "Contrats Actifs", value: "28", trend: "Génération automatique", isUp: true },
        { label: "Revenus (Mois)", value: "24 150 €", trend: "+8% vs mois dernier", isUp: true },
        { label: "En Maintenance", value: "2", trend: "1 révision planifiée", isUp: false }
      ],
      interactiveLabel: "Planning de Réservation Dynamique",
      logs: [
        "INFO  [07:30:10] Démarrage du tableau de bord GT Location Agadir.",
        "SUCCESS [07:35:42] Signature électronique reçue pour le contrat #2026-0092.",
        "INFO  [07:35:44] Déclenchement webhook Stripe - Dépôt de garantie capturé : 300,00 €.",
        "INFO  [07:45:00] Télémétrie OBD : Véhicule Peugeot 208 (#AA-123-BB) signale usure plaquettes.",
        "SUCCESS [07:45:02] Fiche de maintenance préventive planifiée pour le 15/06/2026.",
        "INFO  [08:02:11] Restitution enregistrée : Véhicule Renault Clio (#CC-456-DD). Kilométrage validé."
      ]
    },
    agri: {
      title: "AgriFlow Monitor — Irrigation & Récoltes",
      stats: [
        { label: "Humidité Sol", value: "42 %", trend: "Optimale", isUp: true },
        { label: "Cuves d'Eau", value: "92 %", trend: "Réserve sécurisée", isUp: true },
        { label: "Secteurs Irrigués", value: "3 / 6", trend: "Cycle automatisé", isUp: true },
        { label: "Prévision Tonnes", value: "15.4 T", trend: "Récolte estimée (+5%)", isUp: true }
      ],
      interactiveLabel: "Contrôleur de Vannes d'Irrigation",
      logs: [
        "INFO  [06:00:00] Synchronisation des données météo station Agadir-Nord.",
        "INFO  [06:02:12] Capteur humidité parcelle B2 signale 32% (seuil critique : 35%).",
        "SUCCESS [06:02:14] Commande IoT envoyée : Ouverture Électrovanne Parcelle B2.",
        "INFO  [06:30:00] Capteur humidité parcelle B2 remonté à 42%.",
        "SUCCESS [06:30:02] Commande IoT envoyée : Fermeture Électrovanne Parcelle B2.",
        "INFO  [07:00:00] Calcul du rendement de récolte prévisionnel par IA : 15.4 Tonnes de Tomates."
      ]
    }
  };

  // Launch Demo Event Handler
  launchButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const demoType = btn.getAttribute('data-demo');
      openDemo(demoType);
    });
  });

  // Open Demo function
  function openDemo(demoType) {
    activeProject = demoType;
    activeTab = 'dashboard';
    
    // Check Gating Rules
    // Compromise: First demo tested is free. Opening a different/second demo triggers the lead form.
    if (!isUnlocked) {
      if (firstDemoOpened === null) {
        // First demo of session is free, let it pass
        firstDemoOpened = demoType;
        sessionStorage.setItem('first_demo_opened', demoType);
      } else if (firstDemoOpened !== demoType) {
        // Attempting to open a different demo without unlocking triggers the gate
        showGate(true);
      }
    } else {
      showGate(false);
    }

    // Prepare Modal UI
    modalProjectTitle.textContent = simulatorConfigs[demoType].title;
    
    // Update sidebar buttons active state
    simSidebarButtons.forEach(btn => {
      btn.classList.remove('active');
      if (btn.getAttribute('data-tab') === 'dashboard') {
        btn.classList.add('active');
      }
    });

    // Render initial content
    renderSimulatorContent();

    // Show Modal
    simModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // prevent bg scroll
  }

  // Show/Hide Gate Screen
  function showGate(show) {
    if (show) {
      modalGate.classList.add('active');
    } else {
      modalGate.classList.remove('active');
    }
  }

  // Handle Gate Form Unlock
  if (gateForm) {
    gateForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const submitGateBtn = document.getElementById('btn-submit-gate');
      submitGateBtn.disabled = true;
      submitGateBtn.textContent = "Déverrouillage...";

      setTimeout(() => {
        isUnlocked = true;
        localStorage.setItem('erp_demos_unlocked', 'true');
        showGate(false);
        submitGateBtn.disabled = false;
        submitGateBtn.textContent = "Déverrouiller et Tester";
      }, 1000);
    });
  }

  // Close Modal Events
  modalCloseBtn.addEventListener('click', closeModal);
  simModal.addEventListener('click', (e) => {
    if (e.target === simModal) closeModal();
  });

  function closeModal() {
    simModal.classList.remove('active');
    document.body.style.overflow = ''; // restore scroll
  }

  // Handle Simulator Sidebar Tab Clicking
  simSidebarButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      simSidebarButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTab = btn.getAttribute('data-tab');
      renderSimulatorContent();
    });
  });

  // ==========================================
  // 6. RENDER DYNAMIC SIMULATOR CONTENTS
  // ==========================================
  // Custom states inside the active simulators to let users play with sliders/toggles
  let simulatedStates = {
    maritime: { qrCodeText: 'LOT-AGADIR-2026-0045', ships: ['ship-active', '', 'ship-active', '', '', '', 'ship', '', 'ship-active', ''] },
    pharma: { temperatureSlider: 4.2, alertTriggered: false },
    rental: { bookedSlots: { 'day-1-A': true, 'day-3-B': true } },
    agri: { valveA: false, valveB: true, valveC: false }
  };

  function renderSimulatorContent() {
    const config = simulatorConfigs[activeProject];
    if (!config) return;

    if (activeTab === 'dashboard') {
      let statsHtml = '';
      config.stats.forEach(stat => {
        // Adjust temperature value dynamically for pharma if user changed it in Ooutils Interactifs
        let displayValue = stat.value;
        let displayTrend = stat.trend;
        let trendClass = stat.isUp ? 'trend-up' : 'trend-down';
        
        if (activeProject === 'pharma' && stat.label.includes("Temp.")) {
          const t = simulatedStates.pharma.temperatureSlider.toFixed(1);
          displayValue = `${t} °C`;
          if (t > 8.0) {
            displayTrend = "⚠️ HORS CRITIQUE !";
            trendClass = "trend-down";
          } else {
            displayTrend = "Consigne [2°C - 8°C]";
            trendClass = "trend-up";
          }
        }
        
        if (activeProject === 'maritime' && stat.label.includes("Volume")) {
          // Add interactive effect if they clicked something
          displayValue = stat.value;
        }

        statsHtml += `
          <div class="stat-box">
            <div class="stat-box-label">${stat.label}</div>
            <div class="stat-box-val">${displayValue}</div>
            <div class="stat-box-trend ${trendClass}">${displayTrend}</div>
          </div>
        `;
      });

      let mainAreaHtml = '';
      if (activeProject === 'maritime') {
        mainAreaHtml = `
          <div class="widget">
            <div class="widget-header">
              <h5>Volume Quotidien par Bateau (Criée d'Agadir)</h5>
              <span style="color: #64748b; font-size: 12px;">Échelle (Tonne)</span>
            </div>
            <div class="chart-container-sim">
              <div class="chart-bar-sim" style="height: 80%;" data-val="4.2T"></div>
              <div class="chart-bar-sim" style="height: 55%;" data-val="2.8T"></div>
              <div class="chart-bar-sim" style="height: 95%;" data-val="5.1T"></div>
              <div class="chart-bar-sim" style="height: 30%;" data-val="1.5T"></div>
              <div class="chart-bar-sim" style="height: 10%;" data-val="0.5T"></div>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 0 4px;">
              <span class="chart-label-sim">B1</span>
              <span class="chart-label-sim">B2</span>
              <span class="chart-label-sim">B3</span>
              <span class="chart-label-sim">B4</span>
              <span class="chart-label-sim">B5</span>
            </div>
          </div>
          <div class="widget">
            <div class="widget-header">
              <h5>Dernières captures scannées (QR Code)</h5>
            </div>
            <div class="sim-list">
              <div class="sim-list-item">
                <div class="sim-list-item-left">
                  <div class="sim-list-item-icon">🐟</div>
                  <div>
                    <div class="sim-list-item-title">Sardines (LOT-2026-90)</div>
                    <div class="sim-list-item-sub">Bateau: ELABBAR-01</div>
                  </div>
                </div>
                <span class="demo-badge badge-agriculture" style="background-color: rgba(16, 185, 129, 0.15); color: #10b981;">Validé</span>
              </div>
              <div class="sim-list-item">
                <div class="sim-list-item-left">
                  <div class="sim-list-item-icon">🦐</div>
                  <div>
                    <div class="sim-list-item-title">Crevettes (LOT-2026-91)</div>
                    <div class="sim-list-item-sub">Bateau: ELABBAR-03</div>
                  </div>
                </div>
                <span class="demo-badge badge-agriculture" style="background-color: rgba(16, 185, 129, 0.15); color: #10b981;">Validé</span>
              </div>
            </div>
          </div>
        `;
      } else if (activeProject === 'pharma') {
        // Temperature timeline bar
        const tVal = simulatedStates.pharma.temperatureSlider;
        let timelineClass = 'trend-up';
        let timelineMsg = 'Chaîne du froid intacte (Conforme)';
        if (tVal > 8.0) {
          timelineClass = 'trend-down';
          timelineMsg = 'DANGER : ALERTE SURCHAUFFE ! Escalation SMS/Email déclenchée.';
        } else if (tVal < 2.0) {
          timelineClass = 'trend-down';
          timelineMsg = 'DANGER : TEMPÉRATURE TROP BASSE ! Risque de gel.';
        }

        mainAreaHtml = `
          <div class="widget">
            <div class="widget-header">
              <h5>Historique Graphique de Température IoT (Chambre B3)</h5>
              <span class="demo-badge" style="background-color: ${tVal > 8.0 || tVal < 2.0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)'}; color: ${tVal > 8.0 || tVal < 2.0 ? '#ef4444' : '#10b981'};">
                ${tVal > 8.0 || tVal < 2.0 ? 'Alerte' : 'Normal'}
              </span>
            </div>
            
            <div style="background-color: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.03); border-radius: 4px; padding: 20px; text-align: center; margin-bottom: 16px;">
              <div style="font-size: 36px; font-weight: 700; color: ${tVal > 8.0 || tVal < 2.0 ? '#ef4444' : '#10b981'}; font-family: monospace;">
                ${tVal.toFixed(1)} °C
              </div>
              <p style="color: #64748b; font-size: 12px; margin-top: 4px;">Température lue en direct par capteur RF433-B3</p>
            </div>

            <div class="sim-list-item" style="border-left: 3px solid ${tVal > 8.0 || tVal < 2.0 ? '#ef4444' : '#10b981'}; background-color: rgba(255,255,255,0.02);">
              <div class="sim-list-item-left">
                <span style="font-size: 16px;">🔔</span>
                <span style="color: #ffffff; font-weight: 500;">${timelineMsg}</span>
              </div>
            </div>
          </div>

          <div class="widget">
            <div class="widget-header">
              <h5>Statut des Médicaments Stockés</h5>
            </div>
            <div class="sim-list">
              <div class="sim-list-item">
                <div>
                  <div class="sim-list-item-title">Amoxicilline 500mg</div>
                  <div class="sim-list-item-sub">Lot: AM-2026-0012 | Qte: 4,500u</div>
                </div>
                <span class="demo-badge badge-agriculture" style="background-color: rgba(16, 185, 129, 0.15); color: #10b981;">Optimal</span>
              </div>
              <div class="sim-list-item">
                <div>
                  <div class="sim-list-item-title">Vaccin Grippe A/B</div>
                  <div class="sim-list-item-sub">Lot: VC-2026-8841 | Qte: 1,200u</div>
                </div>
                <span class="demo-badge" style="background-color: ${tVal > 8.0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)'}; color: ${tVal > 8.0 ? '#ef4444' : '#10b981'};">
                  ${tVal > 8.0 ? 'Péril Froid' : 'Optimal'}
                </span>
              </div>
            </div>
          </div>
        `;
      } else if (activeProject === 'rental') {
        const usage = 38 + (Object.keys(simulatedStates.rental.bookedSlots).length - 2);
        mainAreaHtml = `
          <div class="widget" style="grid-column: 1 / -1;">
            <div class="widget-header">
              <h5>Visualisation Instantanée du Planning Flotte (Dashboard Simplifié)</h5>
              <span style="color: #64748b; font-size: 12px;">Taux d'occupation : ${((usage/45)*100).toFixed(1)}%</span>
            </div>
            
            <div class="calendar-grid">
              <div class="calendar-header-cell">Véhicule</div>
              <div class="calendar-header-cell">Lun 12</div>
              <div class="calendar-header-cell">Mar 13</div>
              <div class="calendar-header-cell">Mer 14</div>
              <div class="calendar-header-cell">Jeu 15</div>
              <div class="calendar-header-cell">Ven 16</div>

              <!-- Row A -->
              <div class="calendar-cell calendar-vehicle-label">&nbsp;Clio #1</div>
              <div class="calendar-cell">
                ${simulatedStates.rental.bookedSlots['day-1-A'] ? '<div class="calendar-event">Loué - Dupont</div>' : 'Libre'}
              </div>
              <div class="calendar-cell">
                ${simulatedStates.rental.bookedSlots['day-2-A'] ? '<div class="calendar-event">Loué - Dupont</div>' : 'Libre'}
              </div>
              <div class="calendar-cell">Libre</div>
              <div class="calendar-cell">Libre</div>
              <div class="calendar-cell">Libre</div>

              <!-- Row B -->
              <div class="calendar-cell calendar-vehicle-label">&nbsp;Peugeot 208</div>
              <div class="calendar-cell">Libre</div>
              <div class="calendar-cell">Libre</div>
              <div class="calendar-cell">
                ${simulatedStates.rental.bookedSlots['day-3-B'] ? '<div class="calendar-event event-success">Loué - S.A.R.L. Med</div>' : 'Libre'}
              </div>
              <div class="calendar-cell">
                ${simulatedStates.rental.bookedSlots['day-4-B'] ? '<div class="calendar-event event-success">Loué - S.A.R.L. Med</div>' : 'Libre'}
              </div>
              <div class="calendar-cell">Libre</div>

              <!-- Row C -->
              <div class="calendar-cell calendar-vehicle-label">&nbsp;Dacia Duster</div>
              <div class="calendar-cell">Libre</div>
              <div class="calendar-cell">Libre</div>
              <div class="calendar-cell">Libre</div>
              <div class="calendar-cell">
                ${simulatedStates.rental.bookedSlots['day-4-C'] ? '<div class="calendar-event event-warning">Maintenance</div>' : 'Libre'}
              </div>
              <div class="calendar-cell">Libre</div>
            </div>
          </div>
        `;
      } else if (activeProject === 'agri') {
        mainAreaHtml = `
          <div class="widget">
            <div class="widget-header">
              <h5>Répartition d'Humidité par Parcelle (Dernière lecture)</h5>
            </div>
            <div class="chart-container-sim">
              <div class="chart-bar-sim" style="height: ${simulatedStates.agri.valveA ? '78%' : '38%'};" data-val="${simulatedStates.agri.valveA ? '55%' : '38%'}"></div>
              <div class="chart-bar-sim" style="height: ${simulatedStates.agri.valveB ? '85%' : '40%'};" data-val="${simulatedStates.agri.valveB ? '62%' : '40%'}"></div>
              <div class="chart-bar-sim" style="height: ${simulatedStates.agri.valveC ? '72%' : '31%'};" data-val="${simulatedStates.agri.valveC ? '51%' : '31%'}"></div>
            </div>
            <div style="display: flex; justify-content: space-around; width: 100%;">
              <span class="chart-label-sim">Parcelle A</span>
              <span class="chart-label-sim">Parcelle B</span>
              <span class="chart-label-sim">Parcelle C</span>
            </div>
          </div>

          <div class="widget">
            <div class="widget-header">
              <h5>État des Vannes Connectées (IoT)</h5>
            </div>
            <div class="sim-list">
              <div class="sim-list-item">
                <div class="sim-list-item-title">Vanne Parcelle A</div>
                <span class="demo-badge" style="background-color: ${simulatedStates.agri.valveA ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.05)'}; color: ${simulatedStates.agri.valveA ? '#10b981' : '#94a3b8'};">
                  ${simulatedStates.agri.valveA ? 'IRRIGUE' : 'FERMÉ'}
                </span>
              </div>
              <div class="sim-list-item">
                <div class="sim-list-item-title">Vanne Parcelle B</div>
                <span class="demo-badge" style="background-color: ${simulatedStates.agri.valveB ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.05)'}; color: ${simulatedStates.agri.valveB ? '#10b981' : '#94a3b8'};">
                  ${simulatedStates.agri.valveB ? 'IRRIGUE' : 'FERMÉ'}
                </span>
              </div>
              <div class="sim-list-item">
                <div class="sim-list-item-title">Vanne Parcelle C</div>
                <span class="demo-badge" style="background-color: ${simulatedStates.agri.valveC ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.05)'}; color: ${simulatedStates.agri.valveC ? '#10b981' : '#94a3b8'};">
                  ${simulatedStates.agri.valveC ? 'IRRIGUE' : 'FERMÉ'}
                </span>
              </div>
            </div>
          </div>
        `;
      }

      simContentArea.innerHTML = `
        <div class="dash-header">
          <div class="dash-title">
            <h4>Tableau de Bord Principal</h4>
            <p>Données synthétisées en temps réel par les capteurs et workers de l'ERP.</p>
          </div>
          <div class="dash-actions">
            <span class="demo-badge badge-maritime" style="background-color: rgba(37,99,235,0.1); color: #60a5fa; border: 1px solid rgba(37,99,235,0.2);">Simulation Active</span>
          </div>
        </div>
        
        <div class="dash-grid-stats">
          ${statsHtml}
        </div>

        <div class="dash-grid-main">
          ${mainAreaHtml}
        </div>
      `;
    } 
    
    else if (activeTab === 'action') {
      let interactiveWidgetHtml = '';

      if (activeProject === 'maritime') {
        interactiveWidgetHtml = `
          <div class="widget" style="grid-column: 1 / -1;">
            <div class="widget-header">
              <h5>Générateur de QR Code de Traçabilité</h5>
            </div>
            <p style="color: #94a3b8; font-size: 14px; margin-bottom: 20px;">
              Saisissez un identifiant de lot pour simuler la génération et le stockage du code QR de traçabilité.
            </p>
            <div class="qr-preview-box">
              <input type="text" id="qr-input-text" value="${simulatedStates.maritime.qrCodeText}" 
                style="background-color: #0f172a; border: 1px solid rgba(255,255,255,0.1); padding: 10px 14px; border-radius: var(--radius-sm); color: #ffffff; width: 100%; max-width: 300px; text-align: center; margin-bottom: 12px;">
              <button class="btn btn-primary" id="btn-generate-qr-sim" style="padding: 10px 20px;">Générer Code QR & Insérer</button>
              
              <div style="margin-top: 24px; text-align: center;">
                <div class="qr-placeholder" id="qr-target-img">
                  <!-- Simulated QR drawing -->
                  <svg width="100" height="100" viewBox="0 0 29 29" fill="none" stroke="#000000" stroke-width="1">
                    <rect x="0" y="0" width="7" height="7"/>
                    <rect x="1" y="1" width="5" height="5" fill="#000000"/>
                    <rect x="22" y="0" width="7" height="7"/>
                    <rect x="23" y="1" width="5" height="5" fill="#000000"/>
                    <rect x="0" y="22" width="7" height="7"/>
                    <rect x="1" y="23" width="5" height="5" fill="#000000"/>
                    <!-- mock QR dots -->
                    <rect x="3" y="9" width="2" height="2" fill="#000000"/>
                    <rect x="10" y="3" width="2" height="3" fill="#000000"/>
                    <rect x="15" y="1" width="1" height="2" fill="#000000"/>
                    <rect x="12" y="10" width="4" height="4" fill="#000000"/>
                    <rect x="20" y="15" width="3" height="3" fill="#000000"/>
                    <rect x="9" y="20" width="3" height="4" fill="#000000"/>
                    <rect x="18" y="22" width="2" height="2" fill="#000000"/>
                  </svg>
                </div>
                <div style="color: #64748b; font-size: 11px; margin-top: 10px;" id="qr-target-text">
                  LOT: ${simulatedStates.maritime.qrCodeText}
                </div>
              </div>
            </div>
          </div>
        `;
      } 
      
      else if (activeProject === 'pharma') {
        const sliderVal = simulatedStates.pharma.temperatureSlider;
        let warningBoxHtml = '';
        
        if (sliderVal > 8.0) {
          warningBoxHtml = `
            <div style="background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: var(--radius-sm); padding: 16px; margin-top: 20px; color: #ef4444;">
              <strong>⚠️ Alerte Seuil Critique Dépassée (${sliderVal.toFixed(1)}°C)</strong><br>
              Le système a déclenché l'envoi d'un SMS d'escalation au pharmacien responsable et consigne le problème dans les registres de conformité.
            </div>
          `;
        } else if (sliderVal < 2.0) {
          warningBoxHtml = `
            <div style="background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: var(--radius-sm); padding: 16px; margin-top: 20px; color: #ef4444;">
              <strong>⚠️ Alerte Température Trop Basse (${sliderVal.toFixed(1)}°C)</strong><br>
              Alerte gel. Valve de régulation thermique ouverte à 100%.
            </div>
          `;
        }

        interactiveWidgetHtml = `
          <div class="widget" style="grid-column: 1 / -1;">
            <div class="widget-header">
              <h5>Thermostat Chambre Froide Connectée</h5>
            </div>
            <p style="color: #94a3b8; font-size: 14px; margin-bottom: 24px;">
              Faites glisser le curseur pour modifier artificiellement la température lue par la sonde IoT de la chambre froide. Observez la réaction du système de surveillance automatique de Reda.
            </p>
            
            <div style="background-color: #0f172a; padding: 32px; border-radius: var(--radius-md); text-align: center;">
              <div style="font-size: 40px; font-weight: 700; color: ${sliderVal > 8.0 || sliderVal < 2.0 ? '#ef4444' : '#10b981'}; font-family: monospace; margin-bottom: 20px;">
                ${sliderVal.toFixed(1)} °C
              </div>
              
              <input type="range" id="temp-slider-sim" min="0" max="12" step="0.2" value="${sliderVal}"
                style="width: 100%; max-width: 400px; accent-color: var(--color-accent); cursor: pointer;">
              
              <div style="display: flex; justify-content: space-between; max-width: 400px; margin: 8px auto 0; font-size: 11px; color: #64748b;">
                <span>0 °C (Alerte Gel)</span>
                <span>5 °C (Optimal)</span>
                <span>12 °C (Alerte Chaud)</span>
              </div>

              ${warningBoxHtml}
            </div>
          </div>
        `;
      } 
      
      else if (activeProject === 'rental') {
        interactiveWidgetHtml = `
          <div class="widget" style="grid-column: 1 / -1;">
            <div class="widget-header">
              <h5>Simulateur de Réservation Rapide</h5>
            </div>
            <p style="color: #94a3b8; font-size: 14px; margin-bottom: 20px;">
              Cliquez sur les créneaux libres ci-dessous pour effectuer une réservation instantanée et simuler la génération de contrat en arrière-plan.
            </p>
            
            <div style="display: flex; flex-direction: column; gap: 16px;">
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
                <button class="btn btn-secondary sim-book-btn ${simulatedStates.rental.bookedSlots['day-1-A'] ? 'btn-dark' : ''}" data-slot="day-1-A" style="font-size: 12px; padding: 12px 8px;">
                  ${simulatedStates.rental.bookedSlots['day-1-A'] ? '🔒 Clio (Lun 12) - Réservé' : '🟢 Clio (Lun 12) - Réserver'}
                </button>
                <button class="btn btn-secondary sim-book-btn ${simulatedStates.rental.bookedSlots['day-3-B'] ? 'btn-dark' : ''}" data-slot="day-3-B" style="font-size: 12px; padding: 12px 8px;">
                  ${simulatedStates.rental.bookedSlots['day-3-B'] ? '🔒 208 (Mer 14) - Réservé' : '🟢 208 (Mer 14) - Réserver'}
                </button>
                <button class="btn btn-secondary sim-book-btn ${simulatedStates.rental.bookedSlots['day-5-A'] ? 'btn-dark' : ''}" data-slot="day-5-A" style="font-size: 12px; padding: 12px 8px;">
                  ${simulatedStates.rental.bookedSlots['day-5-A'] ? '🔒 Clio (Ven 16) - Réservé' : '🟢 Clio (Ven 16) - Réserver'}
                </button>
              </div>

              <div id="booking-success-toast" style="display: none; background-color: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: var(--radius-sm); padding: 12px; text-align: center; color: #10b981; font-size: 13px;">
                <strong>Réservation Validée !</strong> Contrat d'entreprise simulé & Facture de caution transmises via API.
              </div>
            </div>
          </div>
        `;
      } 
      
      else if (activeProject === 'agri') {
        interactiveWidgetHtml = `
          <div class="widget" style="grid-column: 1 / -1;">
            <div class="widget-header">
              <h5>Contrôleur de Vannes d'Irrigation IoT</h5>
            </div>
            <p style="color: #94a3b8; font-size: 14px; margin-bottom: 24px;">
              Activez/désactivez les vannes d'irrigation par parcelle. Cela envoie une instruction simulée via MQTT aux électrovannes connectées et modifie l'humidité du sol sur le tableau de bord.
            </p>
            
            <div style="background-color: #0f172a; padding: 24px; border-radius: var(--radius-md); display: flex; flex-direction: column; gap: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 12px;">
                <div>
                  <h6 style="color: #ffffff; font-size: 14px; margin-bottom: 2px;">Vanne A (Parcelle Tomates)</h6>
                  <p style="color: #64748b; font-size: 12px;">Capteur actuel: ${simulatedStates.agri.valveA ? '55%' : '38%'} humidité</p>
                </div>
                <button class="btn ${simulatedStates.agri.valveA ? 'btn-primary' : 'btn-secondary'}" id="btn-toggle-valve-a" style="padding: 6px 12px; font-size: 12px;">
                  ${simulatedStates.agri.valveA ? 'Irrigation Active' : 'Fermée'}
                </button>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 12px;">
                <div>
                  <h6 style="color: #ffffff; font-size: 14px; margin-bottom: 2px;">Vanne B (Parcelle Agrumes)</h6>
                  <p style="color: #64748b; font-size: 12px;">Capteur actuel: ${simulatedStates.agri.valveB ? '62%' : '40%'} humidité</p>
                </div>
                <button class="btn ${simulatedStates.agri.valveB ? 'btn-primary' : 'btn-secondary'}" id="btn-toggle-valve-b" style="padding: 6px 12px; font-size: 12px;">
                  ${simulatedStates.agri.valveB ? 'Irrigation Active' : 'Fermée'}
                </button>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <h6 style="color: #ffffff; font-size: 14px; margin-bottom: 2px;">Vanne C (Parcelle Olives)</h6>
                  <p style="color: #64748b; font-size: 12px;">Capteur actuel: ${simulatedStates.agri.valveC ? '51%' : '31%'} humidité</p>
                </div>
                <button class="btn ${simulatedStates.agri.valveC ? 'btn-primary' : 'btn-secondary'}" id="btn-toggle-valve-c" style="padding: 6px 12px; font-size: 12px;">
                  ${simulatedStates.agri.valveC ? 'Irrigation Active' : 'Fermée'}
                </button>
              </div>
            </div>
          </div>
        `;
      }

      simContentArea.innerHTML = `
        <div class="dash-header">
          <div class="dash-title">
            <h4>${config.interactiveLabel}</h4>
            <p>Interagissez avec le matériel simulé et observez le comportement opérationnel de l'ERP.</p>
          </div>
        </div>

        <div class="dash-grid-main full-width">
          ${interactiveWidgetHtml}
        </div>
      `;

      // Set up events inside action tab
      setupInteractiveEvents();
    } 
    
    else if (activeTab === 'logs') {
      let logsHtml = '';
      config.logs.forEach(log => {
        let logColor = '#94a3b8';
        if (log.includes("SUCCESS")) logColor = '#10b981';
        if (log.includes("WARNING")) logColor = '#fbbf24';
        if (log.includes("DANGER") || log.includes("ERROR")) logColor = '#ef4444';

        logsHtml += `<div style="margin-bottom: 6px; font-family: monospace; font-size: 12px; color: ${logColor}; line-height: 1.4;">${log}</div>`;
      });

      // Add a simulated live appending log line every 4 seconds
      simContentArea.innerHTML = `
        <div class="dash-header">
          <div class="dash-title">
            <h4>Fichiers de Journaux & Événements</h4>
            <p>Traces d'exécution en direct générées par les scripts backend de Reda.</p>
          </div>
        </div>

        <div class="widget" style="background-color: #05070f; border: 1px solid rgba(255,255,255,0.06); padding: 20px; border-radius: var(--radius-md); flex-grow: 1;">
          <div id="logs-stream-container" style="overflow-y: auto; max-height: 300px; display: flex; flex-direction: column;">
            ${logsHtml}
          </div>
          <div style="display: flex; align-items: center; gap: 8px; margin-top: 16px; color: #64748b; font-size: 11px;">
            <span style="width: 6px; height: 6px; border-radius: 50%; background-color: var(--color-success); display: inline-block; animation: pulseGlow 1.5s infinite;"></span>
            <span>Flux de logs en direct actif...</span>
          </div>
        </div>
      `;
    }
  }

  // Bind interactive actions inside Outils Interactifs tab
  function setupInteractiveEvents() {
    if (activeProject === 'maritime') {
      const btnGenQr = document.getElementById('btn-generate-qr-sim');
      const qrInput = document.getElementById('qr-input-text');
      const qrText = document.getElementById('qr-target-text');
      
      if (btnGenQr) {
        btnGenQr.addEventListener('click', () => {
          const val = qrInput.value.trim() || 'LOT-2026';
          simulatedStates.maritime.qrCodeText = val;
          qrText.textContent = `LOT: ${val}`;
          
          // Add a log entry dynamically
          const now = new Date().toLocaleTimeString('fr-FR');
          simulatorConfigs.maritime.logs.push(`SUCCESS [${now}] QR code régénéré pour le lot ${val}.`);
          
          btnGenQr.textContent = "Code QR Validé ✓";
          setTimeout(() => {
            btnGenQr.textContent = "Générer Code QR & Insérer";
          }, 1000);
        });
      }
    } 
    
    else if (activeProject === 'pharma') {
      const tempSlider = document.getElementById('temp-slider-sim');
      if (tempSlider) {
        tempSlider.addEventListener('input', (e) => {
          const val = parseFloat(e.target.value);
          simulatedStates.pharma.temperatureSlider = val;
          
          // Re-render immediately to update visual indicators
          renderSimulatorContent();
          
          // Dynamic log entries on extreme temperature states
          const now = new Date().toLocaleTimeString('fr-FR');
          if (val > 8.0) {
            if (!simulatedStates.pharma.alertTriggered) {
              simulatorConfigs.pharma.logs.push(`DANGER [${now}] Incident thermique ! Chambre B3 enregistre ${val}°C. Alerte email envoyée.`);
              simulatedStates.pharma.alertTriggered = true;
            }
          } else {
            if (simulatedStates.pharma.alertTriggered && val >= 2.0 && val <= 8.0) {
              simulatorConfigs.pharma.logs.push(`SUCCESS [${now}] Retour à la normale. Température stabilisée à ${val}°C.`);
              simulatedStates.pharma.alertTriggered = false;
            }
          }
        });
      }
    } 
    
    else if (activeProject === 'rental') {
      const bookButtons = document.querySelectorAll('.sim-book-btn');
      const toast = document.getElementById('booking-success-toast');
      
      bookButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const slotId = btn.getAttribute('data-slot');
          const isBooked = simulatedStates.rental.bookedSlots[slotId];
          
          if (!isBooked) {
            simulatedStates.rental.bookedSlots[slotId] = true;
            btn.classList.add('btn-dark');
            
            let vehicleName = slotId.includes('A') ? 'Renault Clio' : 'Peugeot 208';
            let dayName = slotId.includes('day-1') ? 'Lundi 12' : (slotId.includes('day-3') ? 'Mercredi 14' : 'Vendredi 16');
            
            btn.innerHTML = `🔒 ${slotId.includes('A') ? 'Clio' : '208'} (${slotId.includes('day-1') ? 'Lun' : 'Mer'}) - Réservé`;
            
            // Show toast feedback
            if (toast) {
              toast.style.display = 'block';
              setTimeout(() => {
                toast.style.display = 'none';
              }, 3000);
            }
            
            // Add to system logs
            const now = new Date().toLocaleTimeString('fr-FR');
            simulatorConfigs.rental.logs.push(`SUCCESS [${now}] Réservation effectuée pour le véhicule ${vehicleName} le ${dayName}.`);
          }
        });
      });
    } 
    
    else if (activeProject === 'agri') {
      const btnValveA = document.getElementById('btn-toggle-valve-a');
      const btnValveB = document.getElementById('btn-toggle-valve-b');
      const btnValveC = document.getElementById('btn-toggle-valve-c');
      
      const now = new Date().toLocaleTimeString('fr-FR');

      if (btnValveA) {
        btnValveA.addEventListener('click', () => {
          simulatedStates.agri.valveA = !simulatedStates.agri.valveA;
          btnValveA.className = simulatedStates.agri.valveA ? 'btn btn-primary' : 'btn btn-secondary';
          btnValveA.textContent = simulatedStates.agri.valveA ? 'Irrigation Active' : 'Fermée';
          simulatorConfigs.agri.logs.push(`INFO  [${now}] Vanne A (Tomates) commutée sur ${simulatedStates.agri.valveA ? 'OPEN' : 'CLOSE'}.`);
          renderSimulatorContent();
        });
      }

      if (btnValveB) {
        btnValveB.addEventListener('click', () => {
          simulatedStates.agri.valveB = !simulatedStates.agri.valveB;
          btnValveB.className = simulatedStates.agri.valveB ? 'btn btn-primary' : 'btn btn-secondary';
          btnValveB.textContent = simulatedStates.agri.valveB ? 'Irrigation Active' : 'Fermée';
          simulatorConfigs.agri.logs.push(`INFO  [${now}] Vanne B (Agrumes) commutée sur ${simulatedStates.agri.valveB ? 'OPEN' : 'CLOSE'}.`);
          renderSimulatorContent();
        });
      }

      if (btnValveC) {
        btnValveC.addEventListener('click', () => {
          simulatedStates.agri.valveC = !simulatedStates.agri.valveC;
          btnValveC.className = simulatedStates.agri.valveC ? 'btn btn-primary' : 'btn btn-secondary';
          btnValveC.textContent = simulatedStates.agri.valveC ? 'Irrigation Active' : 'Fermée';
          simulatorConfigs.agri.logs.push(`INFO  [${now}] Vanne C (Olives) commutée sur ${simulatedStates.agri.valveC ? 'OPEN' : 'CLOSE'}.`);
          renderSimulatorContent();
        });
      }
    }
  }

});
