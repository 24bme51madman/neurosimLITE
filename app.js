// NEUROSIM Mobile Real-Time Signal Renderer & DSP Processor
const canvas = document.getElementById('eegCanvas');
const ctx = canvas.getContext('2d');

let sampleIndex = 0;
const buffer = new Float32Array(500);

const sliderD = document.getElementById('sliderD');
const sliderT = document.getElementById('sliderT');
const sliderA = document.getElementById('sliderA');
const sliderB = document.getElementById('sliderB');

function renderWaveform() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    ctx.fillStyle = '#0B0E14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Grid
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < canvas.width; x += 40) { ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); }
    for (let y = 0; y < canvas.height; y += 30) { ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); }
    ctx.stroke();

    // Waveform Trace
    ctx.strokeStyle = '#00F0FF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const sliceWidth = canvas.width / buffer.length;
    let x = 0;
    
    for (let i = 0; i < buffer.length; i++) {
        const v = buffer[i];
        const y = (canvas.height / 2) - (v * (canvas.height / 6));
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
    }
    ctx.stroke();
}

function updateSignal() {
    const d = sliderD.value / 100;
    const t = sliderT.value / 100;
    const a = sliderA.value / 100;
    const b = sliderB.value / 100;

    const time = sampleIndex / 250;
    const val = (d * Math.sin(2 * Math.PI * 2 * time)) +
                (t * Math.sin(2 * Math.PI * 6 * time)) +
                (a * Math.sin(2 * Math.PI * 10 * time)) +
                (b * Math.sin(2 * Math.PI * 20 * time)) +
                ((Math.random() - 0.5) * 0.1);

    // Shift buffer
    for (let i = 0; i < buffer.length - 1; i++) {
        buffer[i] = buffer[i + 1];
    }
    buffer[buffer.length - 1] = val;
    sampleIndex++;

    // Compute dominant band
    const bands = { Delta: d, Theta: t, Alpha: a, Beta: b };
    const dom = Object.keys(bands).reduce((max, key) => bands[key] > bands[max] ? key : max, 'Alpha');
    
    document.getElementById('domBand').innerText = dom.toUpperCase();
    
    const badge = document.getElementById('stateBadge');
    if (dom === 'Alpha') {
        badge.innerText = 'RELAXED / LOW';
        badge.style.color = '#10B981';
        badge.style.borderColor = '#10B981';
        badge.style.backgroundColor = 'rgba(16, 185, 129, 0.15)';
    } else if (dom === 'Beta') {
        badge.innerText = 'ALERT / HIGH';
        badge.style.color = '#EC4899';
        badge.style.borderColor = '#EC4899';
        badge.style.backgroundColor = 'rgba(236, 72, 153, 0.15)';
    } else {
        badge.innerText = 'MODERATE';
        badge.style.color = '#F59E0B';
        badge.style.borderColor = '#F59E0B';
        badge.style.backgroundColor = 'rgba(245, 158, 11, 0.15)';
    }

    renderWaveform();
}

sliderD.addEventListener('input', () => document.getElementById('valD').innerText = sliderD.value + '%');
sliderT.addEventListener('input', () => document.getElementById('valT').innerText = sliderT.value + '%');
sliderA.addEventListener('input', () => document.getElementById('valA').innerText = sliderA.value + '%');
sliderB.addEventListener('input', () => document.getElementById('valB').innerText = sliderB.value + '%');

setInterval(updateSignal, 20);
