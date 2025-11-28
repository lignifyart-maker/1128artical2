// Draggable Input Cards with Snap and Position Memory

class DraggableCard {
    constructor(cardElement, index) {
        this.card = cardElement;
        this.index = index;
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.offsetX = 0;
        this.offsetY = 0;
        this.snapThreshold = 20; // pixels for snap effect

        this.init();
    }

    init() {
        // Load saved position or use default
        const savedPos = this.loadPosition();
        if (savedPos) {
            this.setPosition(savedPos.x, savedPos.y);
        } else {
            this.setDefaultPosition();
        }

        // Add event listeners
        this.card.addEventListener('mousedown', this.onMouseDown.bind(this));
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        document.addEventListener('mouseup', this.onMouseUp.bind(this));

        // Prevent dragging on textarea
        const textarea = this.card.querySelector('.input-textarea');
        if (textarea) {
            textarea.addEventListener('mousedown', (e) => e.stopPropagation());
        }
    }

    setDefaultPosition() {
        const positions = [
            { x: 50, y: 50 },      // Left
            { x: 480, y: 50 },     // Center
            { x: 910, y: 50 }      // Right
        ];

        if (positions[this.index]) {
            this.setPosition(positions[this.index].x, positions[this.index].y);
        }
    }

    setPosition(x, y) {
        this.card.style.left = `${x}px`;
        this.card.style.top = `${y}px`;
    }

    getPosition() {
        return {
            x: parseInt(this.card.style.left) || 0,
            y: parseInt(this.card.style.top) || 0
        };
    }

    onMouseDown(e) {
        // Only drag from header area, not textarea
        if (e.target.classList.contains('input-textarea')) {
            return;
        }

        this.isDragging = true;
        this.card.classList.add('dragging');

        const pos = this.getPosition();
        this.startX = e.clientX - pos.x;
        this.startY = e.clientY - pos.y;

        e.preventDefault();
    }

    onMouseMove(e) {
        if (!this.isDragging) return;

        let x = e.clientX - this.startX;
        let y = e.clientY - this.startY;

        // Apply snap effect
        x = this.applySnap(x, 'x');
        y = this.applySnap(y, 'y');

        // Keep within viewport
        const maxX = window.innerWidth - this.card.offsetWidth - 20;
        const maxY = window.innerHeight - this.card.offsetHeight - 20;

        x = Math.max(20, Math.min(x, maxX));
        y = Math.max(20, Math.min(y, maxY));

        this.setPosition(x, y);
    }

    applySnap(value, axis) {
        const snapPoints = axis === 'x'
            ? [50, window.innerWidth / 2 - 200, window.innerWidth - 450]
            : [50, window.innerHeight / 2 - 300];

        for (const snap of snapPoints) {
            if (Math.abs(value - snap) < this.snapThreshold) {
                return snap;
            }
        }

        return value;
    }

    onMouseUp() {
        if (this.isDragging) {
            this.isDragging = false;
            this.card.classList.remove('dragging');

            // Save position
            this.savePosition();
        }
    }

    savePosition() {
        const pos = this.getPosition();
        localStorage.setItem(`card-position-${this.index}`, JSON.stringify(pos));
    }

    loadPosition() {
        const saved = localStorage.getItem(`card-position-${this.index}`);
        return saved ? JSON.parse(saved) : null;
    }
}

// Initialize draggable cards
function initDraggableCards() {
    const cards = document.querySelectorAll('.input-card');
    cards.forEach((card, index) => {
        new DraggableCard(card, index);
    });
}

// Export for use in app.js
window.initDraggableCards = initDraggableCards;
