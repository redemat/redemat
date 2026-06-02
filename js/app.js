/**
 * REDEMAT - Enrutador Dinámico y Motor SVG de Simulación
 * Licenciatura en Matemáticas - Universidad de Caldas
 */

document.addEventListener("DOMContentLoaded", async function() {
    // Cargar asíncronamente los componentes modulares de NAV y FOOTER
    await loadTemplate("nav-container", "pages/nav.html");
    await loadTemplate("footer-container", "pages/footer.html");

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});

/**
 * Carga un archivo HTML parcial en un contenedor específico
 */
async function loadTemplate(containerId, filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`No se pudo cargar la plantilla: ${filePath}`);
        const html = await response.text();
        document.getElementById(containerId).innerHTML = html;
    } catch (error) {
        console.error(`Error de REDEMAT al cargar módulo modular:`, error);
    }
}

// Almacenamiento temporal de estados del enrutador
const currentView = {
    id: 'inicio'
};

/**
 * Enrutador asíncrono SPA
 * Carga de forma modular los contenidos de la carpeta /pages
 */
async function navigateTo(sectionId) {
    const startSection = document.getElementById("sec-inicio");
    const dynamicContainer = document.getElementById("dynamic-content");
    
    // Resetear clases de navegación activa en el nav dinámico recién inyectado
    document.querySelectorAll(".nav-btn").forEach(btn => {
        btn.classList.remove("text-ucaldas-yellow", "bg-white/10");
        btn.classList.add("text-slate-200");
    });

    // Activar botón en el menú
    const activeBtn = document.getElementById("nav-" + sectionId);
    if (activeBtn) {
        activeBtn.classList.add("text-ucaldas-yellow", "bg-white/10");
        activeBtn.classList.remove("text-slate-200");
    }

    if (sectionId === 'inicio') {
        startSection.classList.remove("hidden");
        dynamicContainer.classList.add("hidden");
        dynamicContainer.innerHTML = "";
        currentView.id = 'inicio';
        return;
    }

    // Carga asíncrona de archivos HTML modulares
    startSection.classList.add("hidden");
    dynamicContainer.classList.remove("hidden");
    
    let pagePath = `pages/${sectionId}.html`;
    if (sectionId === 'historial') {
        pagePath = `pages/documentos-repositorios.html`;
    }

    try {
        const response = await fetch(pagePath);
        if (!response.ok) throw new Error("No se pudo cargar la vista del módulo solicitado.");
        const html = await response.text();
        
        dynamicContainer.innerHTML = html;
        currentView.id = sectionId;
        
        // Re-inicializar iconos dinámicos cargados por Fetch
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Si se carga la caja de polinomios, inicializar simulador y LaTeX
        if (sectionId === 'caja-polinomios') {
            renderStaticLaTeX();
            initCajaSimulator();
            // Cargar por defecto la pestaña de 2026 dentro de documentos-repositorios si se requiere
            toggleYear('2026');
        }

        // Si se carga la sección de documentos-repositorios o historial
        if (sectionId === 'historial') {
            toggleYear('2026');
        }

    } catch (error) {
        dynamicContainer.innerHTML = `
            <div class="max-w-md mx-auto my-12 text-center p-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <i data-lucide="alert-triangle" class="w-12 h-12 text-red-500 mx-auto mb-4"></i>
                <h3 class="font-bold text-lg text-slate-800">Error de Conexión</h3>
                <p class="text-sm text-slate-500 mt-2">La sección "${sectionId}" no se pudo sincronizar de forma asíncrona.</p>
                <button onclick="navigateTo('inicio')" class="mt-4 bg-ucaldas-blue text-white font-bold text-xs py-2 px-4 rounded-xl">Volver al Inicio</button>
            </div>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

/**
 * Control de Pestañas de Años (Carga asíncrona de contenido_2025 o contenido_2026)
 */
async function toggleYear(year) {
    const tabContainer = document.getElementById("historial-dinamico-container");
    if (!tabContainer) return;

    // Actualizar estados visuales de los botones de pestañas
    const btn2025 = document.getElementById("tab-2025");
    const btn2026 = document.getElementById("tab-2026");

    if (btn2025 && btn2026) {
        btn2025.className = "px-5 py-2 rounded-lg text-xs font-bold transition-all text-slate-500 hover:text-slate-800";
        btn2026.className = "px-5 py-2 rounded-lg text-xs font-bold transition-all text-slate-500 hover:text-slate-800";
        
        if (year === '2025') {
            btn2025.className = "px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-sm bg-white text-ucaldas-blue";
        } else {
            btn2026.className = "px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-sm bg-white text-ucaldas-blue";
        }
    }

    try {
        const response = await fetch(`pages/contenido-${year}.html`);
        if (!response.ok) throw new Error("No se pudo cargar el archivo histórico del año seleccionado.");
        const html = await response.text();
        tabContainer.innerHTML = html;

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    } catch (error) {
        tabContainer.innerHTML = `<p class="text-sm text-red-500 p-4">Error: ${error.message}</p>`;
    }
}

/**
 * Render de Fórmulas Matemáticas con KaTeX
 */
function renderStaticLaTeX() {
    if (typeof katex === 'undefined') return;

    const eq1 = document.getElementById('latex-eq1');
    const eq2 = document.getElementById('latex-eq2');
    if (eq1) katex.render("(x + a)(x + b)", eq1, { throwOnError: false });
    if (eq2) katex.render("x^2 + (a + b)x + ab", eq2, { throwOnError: false });
    
    // Configuración de variables en el simulador
    const lx = document.getElementById('eq-x-label');
    const la = document.getElementById('eq-a-label');
    const lb = document.getElementById('eq-b-label');
    if (lx) katex.render("x", lx, { throwOnError: false });
    if (la) katex.render("a", la, { throwOnError: false });
    if (lb) katex.render("b", lb, { throwOnError: false });

    // Leyendas
    const l_x2 = document.getElementById('l-x2');
    const l_ax = document.getElementById('l-ax');
    const l_bx = document.getElementById('l-bx');
    const l_ab = document.getElementById('l-ab');
    if (l_x2) katex.render("x^2", l_x2, { throwOnError: false });
    if (l_ax) katex.render("ax", l_ax, { throwOnError: false });
    if (l_bx) katex.render("bx", l_bx, { throwOnError: false });
    if (l_ab) katex.render("ab", l_ab, { throwOnError: false });
}

/**
 * Motor del Simulador de Caja de Polinomios
 */
function initCajaSimulator() {
    const sliderX = document.getElementById("slider-x");
    const sliderA = document.getElementById("slider-a");
    const sliderB = document.getElementById("slider-b");

    if (!sliderX || !sliderA || !sliderB) return;

    [sliderX, sliderA, sliderB].forEach(slider => {
        slider.addEventListener("input", function() {
            updateSim(parseFloat(sliderX.value), parseFloat(sliderA.value), parseFloat(sliderB.value));
        });
    });

    updateSim(3.0, 2.0, 1.5);
}

function updateSim(x, a, b) {
    const valX = document.getElementById("val-x");
    const valA = document.getElementById("val-a");
    const valB = document.getElementById("val-b");

    if (valX) valX.textContent = x.toFixed(1);
    if (valA) valA.textContent = a.toFixed(1);
    if (valB) valB.textContent = b.toFixed(1);

    const areaX2 = x * x;
    const areaAx = a * x;
    const areaBx = b * x;
    const areaAb = a * b;
    const areaTotal = areaX2 + areaAx + areaBx + areaAb;

    const cx2 = document.getElementById("calc-x2");
    const cax = document.getElementById("calc-ax");
    const cbx = document.getElementById("calc-bx");
    const cab = document.getElementById("calc-ab");
    const ctotal = document.getElementById("calc-total");

    if (cx2) cx2.textContent = areaX2.toFixed(2);
    if (cax) cax.textContent = areaAx.toFixed(2);
    if (cbx) cbx.textContent = areaBx.toFixed(2);
    if (cab) cab.textContent = areaAb.toFixed(2);
    if (ctotal) ctotal.textContent = areaTotal.toFixed(2);

    const baseFactor = 32;
    const padding = 30;

    const widthX = x * baseFactor;
    const heightX = x * baseFactor;
    const widthA = a * baseFactor;
    const heightB = b * baseFactor;

    const svg = document.getElementById("svg-caja");
    if (!svg) return;

    svg.innerHTML = `
        <rect x="${padding}" y="${padding}" width="${widthX}" height="${heightX}" fill="#6366F1" stroke="#4F46E5" stroke-width="2" rx="4" opacity="0.9"></rect>
        <text x="${padding + widthX/2}" y="${padding + heightX/2}" fill="white" font-weight="bold" font-size="14" text-anchor="middle">x²</text>
        
        <rect x="${padding + widthX}" y="${padding}" width="${widthA}" height="${heightX}" fill="#3B82F6" stroke="#2563EB" stroke-width="2" rx="4" opacity="0.9"></rect>
        <text x="${padding + widthX + widthA/2}" y="${padding + heightX/2}" fill="white" font-weight="bold" font-size="14" text-anchor="middle">ax</text>
        
        <rect x="${padding}" y="${padding + heightX}" width="${widthX}" height="${heightB}" fill="#F59E0B" stroke="#D97706" stroke-width="2" rx="4" opacity="0.9"></rect>
        <text x="${padding + widthX/2}" y="${padding + heightX + heightB/2}" fill="white" font-weight="bold" font-size="14" text-anchor="middle">bx</text>
        
        <rect x="${padding + widthX}" y="${padding + heightX}" width="${widthA}" height="${heightB}" fill="#10B981" stroke="#059669" stroke-width="2" rx="4" opacity="0.9"></rect>
        <text x="${padding + widthX + widthA/2}" y="${padding + heightX + heightB/2}" fill="white" font-weight="bold" font-size="14" text-anchor="middle">ab</text>

        <line x1="${padding}" y1="${padding - 10}" x2="${padding + widthX}" y2="${padding - 10}" stroke="#475569" stroke-width="1.5" stroke-dasharray="2,2"></line>
        <text x="${padding + widthX/2}" y="${padding - 15}" fill="#475569" font-size="11" font-weight="bold" text-anchor="middle">x = ${x.toFixed(1)}</text>
        
        <line x1="${padding + widthX}" y1="${padding - 10}" x2="${padding + widthX + widthA}" y2="${padding - 10}" stroke="#2563EB" stroke-width="1.5" stroke-dasharray="2,2"></line>
        <text x="${padding + widthX + widthA/2}" y="${padding - 15}" fill="#2563EB" font-size="11" font-weight="bold" text-anchor="middle">a = ${a.toFixed(1)}</text>

        <line x1="${padding - 10}" y1="${padding}" x2="${padding - 10}" y2="${padding + heightX}" stroke="#475569" stroke-width="1.5" stroke-dasharray="2,2"></line>
        <text x="${padding - 15}" y="${padding + heightX/2}" fill="#475569" font-size="11" font-weight="bold" text-anchor="middle" transform="rotate(-90 ${padding - 15} ${padding + heightX/2})">x = ${x.toFixed(1)}</text>
        
        <line x1="${padding - 10}" y1="${padding + heightX}" x2="${padding - 10}" y2="${padding + heightX + heightB}" stroke="#D97706" stroke-width="1.5" stroke-dasharray="2,2"></line>
        <text x="${padding - 15}" y="${padding + heightX + heightB/2}" fill="#D97706" font-size="11" font-weight="bold" text-anchor="middle" transform="rotate(-90 ${padding - 15} ${padding + heightX + heightB/2})">b = ${b.toFixed(1)}</text>
    `;

    const latexDinamico = document.getElementById('latex-dinamico');
    if (latexDinamico && typeof katex !== 'undefined') {
        const latexStr = `(${x.toFixed(1)} + ${a.toFixed(1)})(${x.toFixed(1)} + ${b.toFixed(1)}) = ${areaX2.toFixed(1)} + ${areaAx.toFixed(1)} + ${areaBx.toFixed(1)} + ${areaAb.toFixed(1)} = ${areaTotal.toFixed(2)}`;
        katex.render(latexStr, latexDinamico, { throwOnError: false });
    }
}

// Funciones globales de UI auxiliares
function simulateDownload(filename) {
    simulateToast(`Iniciando descarga: ${filename}`);
}

function simulateToast(message) {
    const toast = document.getElementById("toast-notif");
    const toastText = document.getElementById("toast-text");
    if (!toast || !toastText) return;

    toastText.textContent = message;
    toast.classList.remove("translate-y-20", "opacity-0");
    toast.classList.add("translate-y-0", "opacity-100");
    
    setTimeout(() => {
        toast.classList.remove("translate-y-0", "opacity-100");
        toast.classList.add("translate-y-20", "opacity-0");
    }, 3000);
}

function openTexModal() {
    const modal = document.getElementById("tex-modal");
    if (modal) modal.classList.remove("hidden");
}

function closeTexModal() {
    const modal = document.getElementById("tex-modal");
    if (modal) modal.classList.add("hidden");
}

function copyToClipboard() {
    const codeBlock = document.getElementById("latex-code-block");
    if (!codeBlock) return;

    const tempTextArea = document.createElement("textarea");
    tempTextArea.value = codeBlock.innerText;
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    document.execCommand('copy');
    document.body.removeChild(tempTextArea);
    
    simulateToast("¡Código LaTeX copiado con éxito!");
}

// Asegurar accesibilidad global de la función de navegación móvil
window.toggleMobileMenu = toggleMobileMenu;