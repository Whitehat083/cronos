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

        // --- MÓDULO 5: ANIMAÇÃO INTERATIVA DA AMPULHETA ---
    function initHourglassAnimation() {
        const section = document.getElementById('time-warp-section');
        const canvas = document.getElementById('hourglass-canvas');
        if (!canvas || !section) return;

        const narrativeSteps = section.querySelectorAll('.narrative-step');
        const ctx = canvas.getContext('2d');
        
        let width, height;
        let particles = [];
        const numParticles = 3000;
        let animationProgress = 0; // Vai de 0 a 1

        // Cores (para fácil customização)
        const particleColor = 'rgba(123, 217, 108, 0.7)'; // --c-primary com transparência
        const hourglassColor = 'rgba(255, 255, 255, 0.2)';

        // --- FUNÇÕES DE DESENHO E ANIMAÇÃO ---
        
        // 1. Setup inicial e redimensionamento do canvas
        function setup() {
            width = canvas.offsetWidth;
            height = canvas.offsetHeight;
            canvas.width = width;
            canvas.height = height;
            createParticles();
            draw();
        }

        // 2. Cria as partículas de areia na parte de cima
        function createParticles() {
            particles = [];
            for (let i = 0; i < numParticles; i++) {
                particles.push({
                    x: Math.random() * width * 0.6 + width * 0.2,
                    y: Math.random() * height * 0.4 + height * 0.05,
                    initialY: height * 0.45 // Ponto onde a 'areia' acumulada começa a subir
                });
            }
        }
        
        // 3. Desenha a forma da ampulheta
        function drawHourglass() {
            ctx.strokeStyle = hourglassColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            // Lados
            ctx.moveTo(width * 0.1, height * 0.05);
            ctx.lineTo(width * 0.4, height * 0.45);
            ctx.lineTo(width * 0.1, height * 0.85);

            ctx.moveTo(width * 0.9, height * 0.05);
            ctx.lineTo(width * 0.6, height * 0.45);
            ctx.lineTo(width * 0.9, height * 0.85);

            // Bases (topo e fundo)
            ctx.moveTo(width * 0.1, height * 0.05);
            ctx.lineTo(width * 0.9, height * 0.05);
            ctx.moveTo(width * 0.1, height * 0.85);
            ctx.lineTo(width * 0.9, height * 0.85);

            ctx.stroke();
        }
        
        // 4. Desenha as partículas com base no progresso do scroll
        function drawParticles() {
            ctx.fillStyle = particleColor;
            
            particles.forEach(p => {
                const particleProgress = (p.y - (height * 0.05)) / (height * 0.4); // De 0 a 1, quão fundo a partícula está
                
                if (animationProgress > particleProgress) {
                    // Partícula já caiu: desenhar no monte de areia de baixo
                    const dropHeight = height * 0.4;
                    const accumulatedY = p.initialY + dropHeight - ((p.initialY + dropHeight - (p.y)) * 0.3);
                    ctx.beginPath();
                    ctx.arc(p.x, accumulatedY, 1, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    // Partícula ainda não caiu: desenhar na posição original
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 1, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
        }
        
        // 5. Função principal de desenho
        function draw() {
            ctx.clearRect(0, 0, width, height);
            drawParticles();
            drawHourglass();
        }

        // --- LÓGICA DE CONTROLE PELO SCROLL ---

        function handleScroll() {
            const rect = section.getBoundingClientRect();
            const sectionHeight = rect.height;
            const viewportHeight = window.innerHeight;

            // Calcula o progresso do scroll DENTRO da seção
            const scrollableDist = sectionHeight - viewportHeight;
            let progress = (-rect.top) / scrollableDist;
            animationProgress = Math.max(0, Math.min(1, progress)); // Limita o valor entre 0 e 1

            // Destaca o parágrafo atual
            const stepIndex = Math.floor(animationProgress * (narrativeSteps.length - 0.01));
            narrativeSteps.forEach((step, index) => {
                step.classList.toggle('active', index === stepIndex);
            });
            
            requestAnimationFrame(draw);
        }

        // --- INICIALIZAÇÃO E EVENT LISTENERS ---

        setup(); // Desenha o estado inicial
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', setup); // Redesenha se a janela mudar de tamanho
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
