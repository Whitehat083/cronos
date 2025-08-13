/**
 * CRONOS UI SCRIPT v2.0
 * Um script modular e eficiente para controlar a interface principal do site Cronos.
 *
 * Módulos Ativos:
 * 1. ThemeToggle: Gerencia a troca de tema (claro/escuro) e persistência.
 * 2. StickyHeader: Adiciona classe de scroll ao header.
 * 3. MobileMenu: Controla toda a lógica do menu mobile, incluindo clonagem e dropdowns.
 */
document.addEventListener('DOMContentLoaded', () => {

   // * MÓDULO 1: SELETOR DE TEMA (COM PADRÃO ESCURO) 
    function initThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        if (!themeToggle) return;

        const htmlElement = document.documentElement;
        
        const applyTheme = (theme) => {
            htmlElement.setAttribute('data-theme', theme);
            localStorage.setItem('cronos-theme', theme);
        };

        // CORREÇÃO ESTÁ AQUI: A lógica para determinar o tema inicial foi simplificada.
        const savedTheme = localStorage.getItem('cronos-theme');
        
        // Use o tema salvo. Se não houver, use 'dark' como padrão. Fim da história.
        applyTheme(savedTheme || 'dark'); 

        // O restante da função permanece igual, permitindo que o usuário troque o tema.
        themeToggle.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            applyTheme(newTheme);
        });
    }
    // --- MÓDULO 2: HEADER COM EFEITO DE SCROLL ---
    function initStickyHeader() {
        const header = document.querySelector('.main-header');
        if (!header) return;

        const handleScroll = () => {
            header.classList.toggle('scrolled', window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll, { passive: true }); // Otimização de performance
    }

    // --- MÓDULO 3: NAVEGAÇÃO MOBILE RESPONSIVA ---
    function initMobileMenu() {
        const hamburgerBtn = document.getElementById('hamburger-button');
        const menuBackdrop = document.getElementById('menu-backdrop');
        const desktopNav = document.querySelector('.nav-links');
        const mobileNavContainer = document.getElementById('mobile-nav-links');
        const body = document.body;

        if (!hamburgerBtn || !desktopNav || !mobileNavContainer) return;

        // Clona os links do desktop para o mobile apenas uma vez.
        mobileNavContainer.innerHTML = desktopNav.innerHTML;
        
        // Função para abrir e fechar o menu.
        const toggleMenu = () => {
            body.classList.toggle('mobile-menu-open');
        };
        
        hamburgerBtn.addEventListener('click', toggleMenu);
        menuBackdrop.addEventListener('click', toggleMenu);

        // Lógica de cliques centralizada para os links dentro do menu mobile
        mobileNavContainer.addEventListener('click', (event) => {
            const link = event.target.closest('a');
            if (!link) return;

            // Se for um link que abre um dropdown...
            if (link.classList.contains('dropdown-toggle')) {
                event.preventDefault(); // Impede a navegação
                const parentItem = link.parentElement;
                
                // Fecha outros dropdowns que possam estar abertos
                const openItems = mobileNavContainer.querySelectorAll('.nav-item.dropdown.open');
                openItems.forEach(item => {
                    if (item !== parentItem) {
                        item.classList.remove('open');
                    }
                });
                
                // Abre/fecha o dropdown atual
                parentItem.classList.toggle('open');
            } 
            // Se for um link normal, fecha o menu antes de navegar
            else {
                body.classList.remove('mobile-menu-open');
            }
        });
    }
// --- MÓDULO 4: ANIMAÇÃO DE CONTADORES DO DASHBOARD ---
    function initCounterAnimation() {
        const dashboardSection = document.querySelector('.dashboard-section');
        // Se a seção não existe nesta página, o módulo encerra silenciosamente.
        if (!dashboardSection) {
            return;
        }

        // Função interna que faz a animação de um único número
        const animateCounter = (element, duration) => {
            const target = +element.getAttribute('data-target');
            let startTime = null;

            const step = (timestamp) => {
                if (!startTime) startTime = timestamp;
                const progress = Math.min((timestamp - startTime) / duration, 1);
                element.innerText = Math.floor(progress * target);
                if (progress < 1) {
                    window.requestAnimationFrame(step);
                } else {
                    element.innerText = target; // Garante o valor final exato
                }
            };
            window.requestAnimationFrame(step);
        };

        // Usa IntersectionObserver para disparar a animação apenas quando a seção está visível
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counters = entry.target.querySelectorAll('.metric-value:not(.roi-text)');
                    counters.forEach(counter => {
                        animateCounter(counter, 2000); // Duração da animação: 2000ms
                    });
                    observer.unobserve(entry.target); // Anima apenas uma vez
                }
            });
        }, {
            threshold: 0.3 // Dispara quando 30% da seção está visível
        });

        observer.observe(dashboardSection);
    }

  // --- MÓDULO 5: ANIMAÇÃO INTERATIVA "O REATOR TEMPORAL" (VERSÃO LEVE) ---
function initHourglassAnimation() {
    const section = document.getElementById('time-warp-section');
    const canvas = document.getElementById('hourglass-canvas');
    if (!canvas || !section) return; // Seção não existe na página, encerra.

    const narrativeSteps = section.querySelectorAll('.narrative-step');
    const ctx = canvas.getContext('2d');
    
    let width, height, ratio;
    let progress = 0; // Controlado pelo scroll (valor de 0 a 1)
    let ripples = []; // Armazena as "ondas" de clique/toque

    // Cores (para fácil customização)
    const reactorColor = 'rgba(255, 255, 255, 0.2)';
    const energyBaseColor = '123, 217, 108'; // Cor RGB de --c-primary para manipular a opacidade
    
    // --- 1. SETUP E REDIMENSIONAMENTO ---
    function setup() {
        ratio = window.devicePixelRatio || 1;
        width = canvas.clientWidth;
        height = canvas.clientHeight;

        if (width === 0 || height === 0) return; // Evita erro se o canvas estiver oculto
        
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        ctx.scale(ratio, ratio); // Ajusta a escala para telas de alta densidade
        draw(); // Desenha o estado inicial
    }

    // --- 2. FUNÇÕES DE DESENHO ---

    // Desenha a estrutura do reator (a "ampulheta")
    function drawReactorFrame() {
        ctx.strokeStyle = reactorColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        // Lado Esquerdo
        ctx.moveTo(width * 0.1, height * 0.05);
        ctx.lineTo(width * 0.45, height * 0.45);
        ctx.lineTo(width * 0.1, height * 0.85);
        // Lado Direito
        ctx.moveTo(width * 0.9, height * 0.05);
        ctx.lineTo(width * 0.55, height * 0.45);
        ctx.lineTo(width * 0.9, height * 0.85);
        // Bases Horizontais
        ctx.moveTo(width * 0.1, height * 0.05);
        ctx.lineTo(width * 0.9, height * 0.05);
        ctx.moveTo(width * 0.1, height * 0.85);
        ctx.lineTo(width * 0.9, height * 0.85);
        ctx.stroke();
    }

    // Desenha os núcleos de energia que mudam com o scroll
    function drawEnergyCores() {
        const centerX = width / 2;
        const topCenterY = height * 0.25;
        const bottomCenterY = height * 0.65;
        const maxRadius = height * 0.15;

        // Núcleo Superior (energia diminui com o scroll)
        const topRadius = maxRadius * (1 - progress);
        if (topRadius > 1) {
            const topGradient = ctx.createRadialGradient(centerX, topCenterY, 0, centerX, topCenterY, topRadius);
            topGradient.addColorStop(0, `rgba(${energyBaseColor}, 0.5)`);
            topGradient.addColorStop(1, `rgba(${energyBaseColor}, 0)`);
            ctx.fillStyle = topGradient;
            ctx.beginPath();
            ctx.arc(centerX, topCenterY, topRadius, 0, Math.PI * 2);
            ctx.fill();
        }

        // Núcleo Inferior (energia aumenta com o scroll)
        const bottomRadius = maxRadius * progress;
        if (bottomRadius > 1) {
            const bottomGradient = ctx.createRadialGradient(centerX, bottomCenterY, 0, centerX, bottomCenterY, bottomRadius);
            bottomGradient.addColorStop(0, `rgba(${energyBaseColor}, 0.5)`);
            bottomGradient.addColorStop(1, `rgba(${energyBaseColor}, 0)`);
            ctx.fillStyle = bottomGradient;
            ctx.beginPath();
            ctx.arc(centerX, bottomCenterY, bottomRadius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Anima as ondas de interação do clique/toque
    function drawRipples() {
        ripples.forEach((ripple, index) => {
            ripple.radius += 1.5;   // Velocidade de expansão
            ripple.opacity -= 0.02; // Velocidade do fade-out

            // Remove a onda quando ela se torna invisível
            if (ripple.opacity <= 0) {
                ripples.splice(index, 1);
            } else {
                ctx.beginPath();
                ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(${energyBaseColor}, ${ripple.opacity})`;
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        });
    }
    
    // Função principal que orquestra o desenho
    function draw() {
        if (!ctx) return;
        ctx.clearRect(0, 0, width, height);
        drawEnergyCores();
        drawReactorFrame();
        drawRipples();
    }

    // Loop de animação contínuo (roda apenas quando necessário)
    function animate() {
        if (ripples.length > 0) { // Otimização: Só redesenha se houver ondas
            draw();
        }
        requestAnimationFrame(animate);
    }

    // --- 3. LÓGICA DE INTERAÇÃO E CONTROLE ---

    function handleScroll() {
        const rect = section.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        // Garante que a distância de rolagem nunca seja menor que 1 para evitar divisão por zero
        const scrollableDist = Math.max(1, rect.height - viewportHeight);
        
        const currentProgress = (-rect.top) / scrollableDist;
        // Limita o valor de progresso entre 0 (topo da seção) e 1 (final da seção)
        progress = Math.max(0, Math.min(1, currentProgress));
        
        // Destaca o parágrafo atual com base no progresso do scroll
        const stepIndex = Math.floor(progress * (narrativeSteps.length - 0.001)); // Pequeno ajuste para garantir que o último item seja selecionado
        narrativeSteps.forEach((step, index) => {
            step.classList.toggle('active', index === stepIndex);
        });
        
        draw(); // Redesenha o canvas para refletir a nova energia dos núcleos
    }
    
    function createRipple(event) {
        const rect = canvas.getBoundingClientRect();
        const x = (event.clientX || event.touches[0].clientX) - rect.left;
        const y = (event.clientY || event.touches[0].clientY) - rect.top;

        ripples.push({ x, y, radius: 0, opacity: 1 });
    }

    // --- 4. INICIALIZAÇÃO E EVENT LISTENERS ---
    
    // Pequeno atraso para garantir que as dimensões do CSS sejam aplicadas
    setTimeout(() => {
        setup();
        animate(); // Inicia o loop de animação
        
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', setup);
        
        canvas.addEventListener('click', createRipple);
        canvas.addEventListener('touchstart', createRipple, { passive: true });
    }, 100);
}
   



    /**
     * PONTO DE ENTRADA PRINCIPAL
     * Executa todos os módulos de UI necessários.
     */
    function main() {
        initThemeToggle();
        initStickyHeader();
        initMobileMenu();
        initCounterAnimation();
        initHourglassAnimation();
    }

    main(); // Inicia o script.
});
