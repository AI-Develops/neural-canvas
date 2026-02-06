// ==========================================
// NEURAL CANVAS - INTERACTIVE VISUALIZATION
// ==========================================

class NeuralNetwork {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.layers = [];
        this.connections = [];
        this.animationId = null;
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        const parent = this.canvas.parentElement;
        this.canvas.width = parent.clientWidth;
        this.canvas.height = parent.clientHeight;
        if (this.layers.length > 0) {
            this.draw();
        }
    }
    
    generate(numLayers, neuronsPerLayer) {
        this.layers = [];
        this.connections = [];
        
        const width = this.canvas.width;
        const height = this.canvas.height;
        const padding = 80;
        const layerSpacing = (width - 2 * padding) / (numLayers - 1);
        
        // Create layers
        for (let i = 0; i < numLayers; i++) {
            const layer = [];
            const neurons = i === 0 || i === numLayers - 1 ? 
                Math.max(3, Math.floor(neuronsPerLayer * 0.6)) : neuronsPerLayer;
            const neuronSpacing = (height - 2 * padding) / (neurons - 1);
            
            for (let j = 0; j < neurons; j++) {
                layer.push({
                    x: padding + i * layerSpacing,
                    y: padding + j * neuronSpacing,
                    activation: 0
                });
            }
            this.layers.push(layer);
        }
        
        // Create connections
        for (let i = 0; i < this.layers.length - 1; i++) {
            for (let j = 0; j < this.layers[i].length; j++) {
                for (let k = 0; k < this.layers[i + 1].length; k++) {
                    this.connections.push({
                        from: this.layers[i][j],
                        to: this.layers[i + 1][k],
                        weight: Math.random() * 2 - 1,
                        active: false
                    });
                }
            }
        }
        
        this.draw();
        this.hideOverlay();
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw connections
        this.connections.forEach(conn => {
            this.ctx.beginPath();
            this.ctx.moveTo(conn.from.x, conn.from.y);
            this.ctx.lineTo(conn.to.x, conn.to.y);
            
            if (conn.active) {
                this.ctx.strokeStyle = `rgba(99, 102, 241, ${0.3 + conn.weight * 0.3})`;
                this.ctx.lineWidth = 2;
            } else {
                this.ctx.strokeStyle = `rgba(148, 163, 184, ${0.1 + Math.abs(conn.weight) * 0.1})`;
                this.ctx.lineWidth = 1;
            }
            
            this.ctx.stroke();
        });
        
        // Draw neurons
        this.layers.forEach((layer, layerIndex) => {
            layer.forEach(neuron => {
                this.ctx.beginPath();
                this.ctx.arc(neuron.x, neuron.y, 8, 0, Math.PI * 2);
                
                if (neuron.activation > 0) {
                    const gradient = this.ctx.createRadialGradient(
                        neuron.x, neuron.y, 0,
                        neuron.x, neuron.y, 12
                    );
                    gradient.addColorStop(0, `rgba(99, 102, 241, ${neuron.activation})`);
                    gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
                    this.ctx.fillStyle = gradient;
                    this.ctx.fill();
                }
                
                this.ctx.fillStyle = neuron.activation > 0 ? 
                    '#6366f1' : '#1a1f2e';
                this.ctx.fill();
                this.ctx.strokeStyle = neuron.activation > 0 ? 
                    '#8b5cf6' : '#334155';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            });
        });
    }
    
    async animateForwardPass() {
        if (this.layers.length === 0) return;
        
        // Reset activations
        this.layers.forEach(layer => {
            layer.forEach(neuron => neuron.activation = 0);
        });
        this.connections.forEach(conn => conn.active = false);
        
        // Animate through layers
        for (let i = 0; i < this.layers.length; i++) {
            // Activate current layer
            this.layers[i].forEach(neuron => {
                neuron.activation = 1;
            });
            
            // Activate connections to next layer
            if (i < this.layers.length - 1) {
                this.connections.forEach(conn => {
                    if (this.layers[i].includes(conn.from)) {
                        conn.active = true;
                    }
                });
            }
            
            this.draw();
            await this.sleep(400);
            
            // Deactivate connections
            this.connections.forEach(conn => conn.active = false);
        }
        
        // Fade out
        await this.sleep(800);
        this.layers.forEach(layer => {
            layer.forEach(neuron => neuron.activation = 0);
        });
        this.draw();
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    hideOverlay() {
        const overlay = document.querySelector('.canvas-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.style.display = 'none', 300);
        }
    }
}

// ==========================================
// INITIALIZATION & EVENT HANDLERS
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    const network = new NeuralNetwork('network-canvas');
    
    // Control elements
    const layersSlider = document.getElementById('layers');
    const neuronsSlider = document.getElementById('neurons');
    const layersValue = document.getElementById('layers-value');
    const neuronsValue = document.getElementById('neurons-value');
    const generateBtn = document.getElementById('generate-network');
    const animateBtn = document.getElementById('animate-forward');
    
    // Update slider values
    layersSlider.addEventListener('input', (e) => {
        layersValue.textContent = e.target.value;
    });
    
    neuronsSlider.addEventListener('input', (e) => {
        neuronsValue.textContent = e.target.value;
    });
    
    // Generate network
    generateBtn.addEventListener('click', () => {
        const numLayers = parseInt(layersSlider.value);
        const neuronsPerLayer = parseInt(neuronsSlider.value);
        network.generate(numLayers, neuronsPerLayer);
    });
    
    // Animate forward pass
    animateBtn.addEventListener('click', () => {
        network.animateForwardPass();
    });
    
    // Template buttons
    const templateButtons = document.querySelectorAll('.template-card .btn');
    templateButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.template-card');
            const templateName = card.querySelector('.template-title').textContent;
            
            // Scroll to demo
            document.getElementById('demo').scrollIntoView({ behavior: 'smooth' });
            
            // Set appropriate values based on template
            setTimeout(() => {
                let layers = 5;
                let neurons = 8;
                
                if (templateName.includes('Feedforward')) {
                    layers = 4;
                    neurons = 6;
                } else if (templateName.includes('Convolutional')) {
                    layers = 6;
                    neurons = 12;
                } else if (templateName.includes('Recurrent')) {
                    layers = 5;
                    neurons = 8;
                } else if (templateName.includes('Transformer')) {
                    layers = 8;
                    neurons = 10;
                } else if (templateName.includes('Autoencoder')) {
                    layers = 7;
                    neurons = 8;
                } else if (templateName.includes('Generative')) {
                    layers = 6;
                    neurons = 10;
                }
                
                layersSlider.value = layers;
                neuronsSlider.value = neurons;
                layersValue.textContent = layers;
                neuronsValue.textContent = neurons;
                
                network.generate(layers, neurons);
            }, 500);
        });
    });
    
    // Smooth scrolling for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
    
    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
            mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);
            navLinks.style.display = isExpanded ? 'none' : 'flex';
        });
    }
});
