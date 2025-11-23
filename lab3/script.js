class Game2048 {
    constructor() {
        this.grid = Array(4).fill().map(() => Array(4).fill(0));
        this.score = this.history = this.newTiles = this.mergedTiles = [];
        this.isGameOver = this.touchStartX = this.touchStartY = 0;
        this.init();
        this.setupEventListeners();
        this.loadGameState();
    }

    init() {
        this.grid = Array(4).fill().map(() => Array(4).fill(0));
        this.score = 0;
        this.history = this.newTiles = this.mergedTiles = [];
        this.isGameOver = 0;
        for (let i = Math.floor(Math.random() * 3) + 1; i--;) this.addRandomTile();
        this.render();
        this.updateScore();
        this.saveGameState();
        this.setMobileControlsVisible(true);
    }

    render() {
        const board = document.getElementById('gameBoard');
        const tiles = board.children;
        if (!tiles.length) {
            while (board.firstChild) board.removeChild(board.firstChild);
            this.grid.forEach((row, i) => row.forEach((val, j) => {
                const tile = document.createElement('div');
                tile.className = 'tile';
                tile.dataset.row = i;
                tile.dataset.col = j;
                board.appendChild(tile);
            }));
        }
        Array.from(board.children).forEach(tile => {
            const row = parseInt(tile.dataset.row), col = parseInt(tile.dataset.col), value = this.grid[row][col];
            tile.textContent = value || '';
            tile.className = 'tile' + (value ? ` tile-${value}` : '');
            if (this.newTiles.some(t => t.row === row && t.col === col)) tile.classList.add('new-tile');
            if (this.mergedTiles.some(t => t.row === row && t.col === col)) tile.classList.add('merged-tile');
        });
        this.newTiles = this.mergedTiles = [];
    }

    addRandomTile() {
        const emptyCells = [];
        for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) if (!this.grid[i][j]) emptyCells.push({row: i, col: j});
        if (emptyCells.length) {
            const {row, col} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.grid[row][col] = Math.random() < 0.9 ? 2 : 4;
            this.newTiles.push({row, col});
        }
    }

    updateScore() {
        document.getElementById('score').textContent = this.score;
        const best = Math.max(this.score, parseInt(localStorage.getItem('bestScore')) || 0);
        localStorage.setItem('bestScore', best);
        document.getElementById('bestScore').textContent = best;
    }

    setMobileControlsVisible(show) {
        const controls = document.getElementById('mobileControls');
        if (controls) controls.style.display = show ? '' : 'none';
    }

    setupEventListeners() {

    }

    saveGameState() {

    }

    loadGameState() {

    }
}

const game = new Game2048();
