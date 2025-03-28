// Confetti.js - A simple confetti animation
// Based on https://www.kirilv.com/canvas-confetti/

const confetti = {
  canvas: null,
  context: null,
  particles: [],
  colors: ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50', '#8BC34A', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'],
  running: false,

  init: function() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '1000';
    document.body.appendChild(this.canvas);
    this.context = this.canvas.getContext('2d');
    
    window.addEventListener('resize', () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    });
  },

  start: function() {
    this.running = true;
    this.particles = [];
    this.createParticles();
    this.loop();
    
    // Stop after 5 seconds
    setTimeout(() => {
      this.stop();
    }, 5000);
  },

  stop: function() {
    this.running = false;
    setTimeout(() => {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.particles = [];
    }, 1000);
  },

  createParticles: function() {
    for (let i = 0; i < 200; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height - this.canvas.height,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        size: Math.random() * 10 + 5,
        speed: Math.random() * 3 + 2,
        angle: Math.random() * 360,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 10 - 5
      });
    }
  },

  loop: function() {
    if (!this.running) return;
    
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      
      p.y += p.speed;
      p.rotation += p.rotationSpeed;
      
      this.context.save();
      this.context.translate(p.x, p.y);
      this.context.rotate(p.rotation * Math.PI / 180);
      
      this.context.fillStyle = p.color;
      this.context.beginPath();
      
      // Draw a star shape
      const spikes = 5;
      const outerRadius = p.size;
      const innerRadius = p.size / 2;
      
      for (let j = 0; j < spikes * 2; j++) {
        const radius = j % 2 === 0 ? outerRadius : innerRadius;
        const angle = (j * Math.PI) / spikes;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        if (j === 0) {
          this.context.moveTo(x, y);
        } else {
          this.context.lineTo(x, y);
        }
      }
      
      this.context.closePath();
      this.context.fill();
      this.context.restore();
      
      // Remove particles that are off-screen
      if (p.y > this.canvas.height + p.size) {
        this.particles.splice(i, 1);
        i--;
      }
    }
    
    // Add new particles if needed
    if (this.particles.length < 100 && this.running) {
      for (let i = 0; i < 10; i++) {
        this.particles.push({
          x: Math.random() * this.canvas.width,
          y: 0,
          color: this.colors[Math.floor(Math.random() * this.colors.length)],
          size: Math.random() * 10 + 5,
          speed: Math.random() * 3 + 2,
          angle: Math.random() * 360,
          rotation: Math.random() * 360,
          rotationSpeed: Math.random() * 10 - 5
        });
      }
    }
    
    requestAnimationFrame(() => this.loop());
  }
};
