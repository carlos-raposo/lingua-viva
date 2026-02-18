const { Engine, World, Bodies, Body, Mouse, MouseConstraint, Events } = Matter;

const engine = Engine.create();
engine.world.gravity.y = 0;

let buttonBodies = [];
const svg = document.getElementById('connections');
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// MAPEAMENTO CORRIGIDO: Usando os data-id do seu HTML
const descriptions = {
    "matriz": "O pulso da língua em tempo real. Captamos o nascimento de gírias e expressões nas redes sociais.",
    "glitch": "A beleza do erro. Uma galeria dedicada às falhas de tradução e corretores automáticos.",
    "eco": "Uma escultura sonora da lusofonia. Experimente a fusão fonética entre territórios.",
    "arquivo": "Arqueologia do bit. Explore os dialetos de fóruns e comunidades digitais esquecidas.",
    "fluxo": "Literatura em mutação. Veja clássicos serem reescritos por algoritmos contemporâneos."
};

// --- PREPARAÇÃO DO TÍTULO ---
const titleH1 = document.querySelector('.hero-title');
if (titleH1) {
    const text = titleH1.innerText;
    titleH1.innerHTML = text.split('').map(char => `<span>${char}</span>`).join('');
}

function playTriggerSound() {
    if (audioCtx.state === 'suspended') return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, audioCtx.currentTime); 
    osc.frequency.exponentialRampToValueAtTime(110, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(); 
    osc.stop(audioCtx.currentTime + 0.1);
}

// --- CONFIGURAÇÃO DO UNIVERSO ---
function setupUniverse() {
    const buttons = document.querySelectorAll('.node-btn');
    const width = window.innerWidth;
    const height = window.innerHeight;

    const centerTitle = Bodies.rectangle(width / 2, height / 2, 550, 200, { isStatic: true });

    const radius = Math.min(width, height) * 0.35;
    
    buttons.forEach((btn, i) => {
        const angle = (i / buttons.length) * Math.PI * 2;
        const x = width / 2 + Math.cos(angle) * radius;
        const y = height / 2 + Math.sin(angle) * radius;

        const body = Bodies.rectangle(x, y, btn.offsetWidth, btn.offsetHeight, {
            restitution: 0.8,
            frictionAir: 0.06,
            chamfer: { radius: 20 }
        });

        body.domElement = btn;
        buttonBodies.push(body);
        btn.style.opacity = "1";

        // EVENTOS DE TOOLTIP CORRIGIDOS
        btn.addEventListener('mouseenter', () => {
            const tooltip = document.getElementById('tooltip');
            const dataId = btn.getAttribute('data-id'); // Pega o data-id do HTML
            if (tooltip && descriptions[dataId]) {
                tooltip.innerText = descriptions[dataId];
                tooltip.style.opacity = "1";
                playTriggerSound();
            }
        });

        btn.addEventListener('mouseleave', () => {
            const tooltip = document.getElementById('tooltip');
            if (tooltip) tooltip.style.opacity = "0";
        });

        // Evento de clique para o botão "Laboratório Glitch"
        if (btn.getAttribute('data-id') === 'glitch') {
            btn.addEventListener('click', () => {
                sessionStorage.setItem('skipManifesto', 'true');
                window.location.href = 'public/glitch.html';
            });
        }

        // Evento de clique para o botão "Matriz Neológica"
        if (btn.getAttribute('data-id') === 'matriz') {
            btn.addEventListener('click', () => {
                sessionStorage.setItem('skipManifesto', 'true');
                window.location.href = 'public/matriz.html';
            });
        }

        // Evento de clique para o botão "Arquivo Morto"
        if (btn.getAttribute('data-id') === 'arquivo') {
            btn.addEventListener('click', () => {
                sessionStorage.setItem('skipManifesto', 'true');
                window.location.href = 'public/arquivo.html';
            });
        }

        // Evento de clique para o botão "Fluxo Sintático"
        if (btn.getAttribute('data-id') === 'fluxo') {
            btn.addEventListener('click', () => {
                sessionStorage.setItem('skipManifesto', 'true');
                window.location.href = 'public/fluxo.html';
            });
        }
    });

    const walls = [
        Bodies.rectangle(width/2, -50, width, 100, { isStatic: true }),
        Bodies.rectangle(width/2, height+50, width, 100, { isStatic: true }),
        Bodies.rectangle(-50, height/2, 100, height, { isStatic: true }),
        Bodies.rectangle(width+50, height/2, 100, height, { isStatic: true })
    ];

    World.add(engine.world, [centerTitle, ...buttonBodies, ...walls]);

    const mouse = Mouse.create(document.body);
    const mConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: { stiffness: 0.1, render: { visible: false } }
    });
    World.add(engine.world, mConstraint);

    Events.on(engine, 'collisionStart', (event) => {
        event.pairs.forEach(pair => {
            [pair.bodyA, pair.bodyB].forEach(body => {
                if (body.domElement) {
                    body.domElement.classList.add('glitch-flash');
                    setTimeout(() => body.domElement.classList.remove('glitch-flash'), 250);
                }
            });
        });
    });

    update();
}

function update() {
    Engine.update(engine, 16.66);
    if (svg) svg.innerHTML = '';

    buttonBodies.forEach((body, i) => {
        const btn = body.domElement;
        const posX = body.position.x - (btn.offsetWidth / 2);
        const posY = body.position.y - (btn.offsetHeight / 2);
        btn.style.transform = `translate(${posX}px, ${posY}px) rotate(${body.angle}rad)`;

        buttonBodies.forEach((other, j) => {
            if (i !== j) {
                const d = Math.hypot(body.position.x - other.position.x, body.position.y - other.position.y);
                if (d < 300) {
                    const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
                    l.setAttribute("x1", body.position.x); l.setAttribute("y1", body.position.y);
                    l.setAttribute("x2", other.position.x); l.setAttribute("y2", other.position.y);
                    l.style.opacity = (1 - d / 300) * 0.2;
                    svg.appendChild(l);
                }
            }
        });
    });
    requestAnimationFrame(update);
}

// SEGUIR RATO (Global)
document.addEventListener('mousemove', (e) => {
    const tooltip = document.getElementById('tooltip');
    if (tooltip && tooltip.style.opacity === "1") {
        tooltip.style.left = (e.clientX + 20) + 'px';
        tooltip.style.top = (e.clientY + 20) + 'px';
    }

    const spans = document.querySelectorAll('.hero-title span');
    spans.forEach(span => {
        const rect = span.getBoundingClientRect();
        const dist = Math.hypot(e.clientX - (rect.left + rect.width/2), e.clientY - (rect.top + rect.height/2));
        if (dist < 200) {
            const weight = 100 + ((1 - dist / 200) * 800);
            span.style.fontVariationSettings = `'wght' ${weight}`;
        } else {
            span.style.fontVariationSettings = `'wght' 100`;
        }
    });
});

// MANIFESTO
window.addEventListener('load', () => {
    // Só pula o manifesto se vier de glitch.html ou matriz.html
    const skipManifesto = sessionStorage.getItem('skipManifesto');
    if (skipManifesto === 'true') {
        const manifesto = document.getElementById('manifesto-overlay');
        if (manifesto) {
            manifesto.style.opacity = "0";
            manifesto.style.visibility = "hidden";
        }
        setupUniverse();
        sessionStorage.removeItem('skipManifesto');
    } else {
        setTimeout(() => {
            const manifesto = document.getElementById('manifesto-overlay');
            if (manifesto) {
                manifesto.style.opacity = "1";
                manifesto.style.visibility = "visible";
            }
        }, 3000);
    }

    const enterBtn = document.getElementById('enter-flow');
    if (enterBtn) {
        enterBtn.onclick = () => {
            const manifesto = document.getElementById('manifesto-overlay');
            manifesto.style.opacity = "0";
            setTimeout(() => {
                manifesto.style.visibility = "hidden";
                setupUniverse();
            }, 1000);
            if (audioCtx.state === 'suspended') audioCtx.resume();
            playTriggerSound();
        };
    }
});

// LOGS
const statusElement = document.getElementById('status-text');
const terminalArea = document.querySelector('.os-terminal');
const logContent = document.getElementById('log-content');
const fakeLogs = ["fetching_data...", "analyzing_syntax...", "node_stable: PT-AO", "node_stable: PT-BR", "stream_active"];

if (terminalArea) {
    terminalArea.addEventListener('click', () => {
        document.getElementById('system-log').style.display = "block";
        setInterval(() => {
            const p = document.createElement('p');
            p.innerText = `> ${fakeLogs[Math.floor(Math.random() * fakeLogs.length)]}`;
            logContent.prepend(p);
            if (logContent.children.length > 8) logContent.lastChild.remove();
        }, 2000);
    });
}