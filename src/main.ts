import './style.css';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx.fillStyle = '#ffe3a3';
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.fillStyle = '#333';
ctx.font = '32px system-ui';
ctx.fillText('Snake scaffold OK', 40, 60);
