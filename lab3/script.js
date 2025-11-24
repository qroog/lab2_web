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
        document.addEventListener('keydown', e => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
                this.moveDir(e.key.replace('Arrow', '').toLowerCase());
            }
        });
	    document.getElementById('newGameBtn').addEventListener('click', () => this.init());
        document.getElementById('undoBtn').addEventListener('click', () => this.undo());
		document.getElementById('saveScoreBtn').addEventListener('click', () => this.saveScore());
        document.getElementById('restartBtn').addEventListener('click', () => {
            document.getElementById('gameOverModal').style.display = 'none';
            document.getElementById('scoreSaved').style.display = 'none';
            document.getElementById('saveScoreBtn').disabled = false;
            document.getElementById('playerName').value = '';
            this.init();
        });

        document.getElementById('playerName').addEventListener('keypress', e => {
            if (e.key === 'Enter') this.saveScore();
        });

        window.addEventListener('click', e => {
            if (e.target.classList.contains('modal')) e.target.style.display = 'none';
        });

        new MutationObserver(mutations => mutations.forEach(m => {
            if (m.target.id === 'gameOverModal' && m.target.style.display === 'flex') 
                document.getElementById('playerName').focus();
        })).observe(document.getElementById('gameOverModal'), {
            attributes: true, attributeFilter: ['style']
        });

        document.getElementById('leaderboardBtn').addEventListener('click', () => this.showLeaderboard());
        document.getElementById('closeLeaderboardBtn').addEventListener('click', () => 
            document.getElementById('leaderboardModal').style.display = 'none'
        );

        const board = document.getElementById('gameBoard');
		board.addEventListener('touchstart', e => {
			this.touchStartX = e.touches[0].clientX;   
			this.touchStartY = e.touches[0].clientY;   
		});

        board.addEventListener('touchend', e => {
            if (!this.touchStartX || !this.touchStartY) return;
			const dx = e.changedTouches[0].clientX - this.touchStartX;
			const dy = e.changedTouches[0].clientY - this.touchStartY;
            if (Math.abs(dx) > Math.abs(dy)) this.moveDir(dx > 0 ? 'right' : 'left');
            else this.moveDir(dy > 0 ? 'down' : 'up');
            this.touchStartX = this.touchStartY = 0;
        });

        document.querySelectorAll('.direction-btn').forEach(btn => 
            btn.addEventListener('click', () => this.moveDir(btn.dataset.direction))
        );


    }

    saveGameState() {
        const state = {grid: this.grid, score: this.score, isGameOver: this.isGameOver};
        localStorage.setItem('gameState', JSON.stringify(state));
        this.history.push(JSON.parse(JSON.stringify(state)));
        if (this.history.length > 10) this.history.shift();
    }
	
    loadGameState() {
        const saved = localStorage.getItem('gameState');
        if (saved) {
            const state = JSON.parse(saved);
            this.grid = state.grid;
            this.score = state.score;
            this.isGameOver = state.isGameOver;
            this.render();
            this.updateScore();
        }
    }
	
    undo() {
        if (this.history.length > 1) {
            this.history.pop();
            const prev = this.history[this.history.length - 1];
            this.grid = JSON.parse(JSON.stringify(prev.grid));
            this.score = prev.score;
            this.isGameOver = prev.isGameOver;
            this.render();
            this.updateScore();
            localStorage.setItem('gameState', JSON.stringify(prev));
        }
    }
	
    saveScore() {
        const name = document.getElementById('playerName').value.trim() || 'Аноним';
        const scores = JSON.parse(localStorage.getItem('leaderboard')) || [];
        scores.push({name, score: this.score, date: new Date().toLocaleDateString('ru-RU')});
        scores.sort((a, b) => b.score - a.score);
        localStorage.setItem('leaderboard', JSON.stringify(scores.slice(0, 10)));
        document.getElementById('scoreSaved').style.display = 'block';
        document.getElementById('saveScoreBtn').disabled = true;
    }

	
    moveDir(dir) {
        if (this.isGameOver) return;
        const oldGrid = JSON.stringify(this.grid);
        this.mergedTiles = [];
        const transpose = g => g.map((_, i) => g.map(row => row[i]));
        const reverse = g => g.map(row => [...row].reverse());
        let grid = this.grid;

        if (dir === 'up') grid = transpose(grid);
        else if (dir === 'down') grid = reverse(transpose(grid));
        else if (dir === 'right') grid = reverse(grid);

        grid = grid.map((row, i) => {
            const line = this.processLine(row);
            return line.map((val, j) => {
                if (val && row[j] !== val) {
                    let actualRow = i, actualCol = j;
                    if (dir === 'up') [actualRow, actualCol] = [j, i];
                    else if (dir === 'down') [actualRow, actualCol] = [3 - j, i];
                    else if (dir === 'right') actualCol = 3 - j;
                    if (row.filter(v => v).length > line.filter(v => v).length) 
                        this.mergedTiles.push({row: actualRow, col: actualCol});
                }
                return val;
            });
        });

        if (dir === 'right') grid = reverse(grid);
        if (dir === 'down') grid = transpose(reverse(grid));
        if (dir === 'up') grid = transpose(grid);

        this.grid = grid;

        if (oldGrid !== JSON.stringify(this.grid)) {
            this.addRandomTile();
            this.render();
            this.updateScore();
            this.saveGameState();
            this.checkGameOver();
        }
    }

    processLine(row) {
        let line = row.filter(v => v);
        for (let i = 0; i < line.length - 1; i++) {
            if (line[i] === line[i + 1]) {
                line[i] *= 2;
                this.score += line[i];
                line.splice(i + 1, 1);
            }
        }
        while (line.length < 4) line.push(0);
        return line;
    }

    checkGameOver() {
        for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
            if (!this.grid[i][j]) return;
            if (j < 3 && this.grid[i][j] === this.grid[i][j + 1]) return;
            if (i < 3 && this.grid[i][j] === this.grid[i + 1][j]) return;
        }
        this.isGameOver = true;
        this.showGameOver();
    }

    showGameOver() {
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOverModal').style.display = 'flex';
    }
	
    showLeaderboard() {
        const scores = JSON.parse(localStorage.getItem('leaderboard')) || [];
        const tbody = document.getElementById('leaderboardBody');
        tbody.innerHTML = scores.length ? scores.map((s, i) => 
            `<tr class="${i < 3 ? 'top-score' : ''}"><td>${i + 1}</td><td>${s.name}</td><td>${s.score}</td><td>${s.date}</td></tr>`
        ).join('') : '<tr><td colspan="4">Нет результатов</td></tr>';
        document.getElementById('leaderboardModal').style.display = 'flex';
    }
	
	
}

const game = new Game2048();
