// Dominó Game Logic
class DominoGame {
    constructor() {
        // Estado do jogo
        this.rounds = [];
        this.currentRound = 0;
        this.allDominoes = this.generateAllDominoes();
        this.gameGoal = 250;
        
        // Pontuação acumulada
        this.playerTotalScore = 0;
        this.aiTotalScore = 0;
        
        this.initializeRound();
        this.setupEventListeners();
        this.render();
    }

    generateAllDominoes() {
        const dominoes = [];
        for (let i = 0; i <= 6; i++) {
            for (let j = i; j <= 6; j++) {
                dominoes.push([i, j]);
            }
        }
        return dominoes.sort(() => Math.random() - 0.5);
    }

    initializeRound() {
        // Embaralhar dominós
        const shuffled = [...this.allDominoes].sort(() => Math.random() - 0.5);
        
        // Distribuir
        const playerHand = shuffled.slice(0, 7);
        const aiHand = shuffled.slice(7, 14);
        const boneyard = shuffled.slice(14);
        
        this.currentRound = {
            playerHand,
            aiHand,
            boneyard,
            mesa: [],
            aiPassed: false,
            playerPassed: false,
            currentPlayer: 'player', // quem começa
            history: []
        };
        
        this.rounds.push(this.currentRound);
    }

    playDomino(domino, isRotated = false) {
        if (!this.canPlayDomino(domino)) {
            return false;
        }

        const round = this.currentRound;
        
        // Remove da mão
        round.playerHand = round.playerHand.filter(d => 
            !(d[0] === domino[0] && d[1] === domino[1])
        );
        
        // Adiciona à mesa
        round.mesa.push({
            domino,
            owner: 'player',
            rotated: isRotated
        });

        round.playerPassed = false;
        round.history.push(`player jogou [${domino[0]},${domino[1]}]`);
        
        // IA joga
        setTimeout(() => this.aiPlay(), 500);
        
        return true;
    }

    canPlayDomino(domino) {
        if (this.currentRound.mesa.length === 0) return true;
        
        const mesa = this.currentRound.mesa;
        const firstDomino = mesa[0].domino;
        const lastDomino = mesa[mesa.length - 1].domino;
        
        const firstPip = firstDomino[0];
        const lastPip = lastDomino[1];
        
        return domino[0] === lastPip || domino[1] === lastPip || 
               domino[0] === firstPip || domino[1] === firstPip;
    }

    getPlayableDominoes(hand) {
        return hand.filter(d => this.canPlayDomino(d));
    }

    aiPlay() {
        const round = this.currentRound;
        const playable = this.getPlayableDominoes(round.aiHand);
        
        if (playable.length === 0) {
            // Tentar puxar do boneyard
            if (round.boneyard.length > 0) {
                const drawn = round.boneyard.pop();
                round.aiHand.push(drawn);
                round.history.push(`AI puxou do boneyard`);
                
                // Tentar jogar novamente
                const playableAgain = this.getPlayableDominoes(round.aiHand);
                if (playableAgain.length === 0) {
                    round.aiPassed = true;
                    round.history.push(`AI passou`);
                    this.checkRoundEnd();
                } else {
                    const domino = this.selectAIMove(playableAgain);
                    round.aiHand = round.aiHand.filter(d => 
                        !(d[0] === domino[0] && d[1] === domino[1])
                    );
                    round.mesa.push({
                        domino,
                        owner: 'ai',
                        rotated: Math.random() > 0.5
                    });
                    round.history.push(`AI jogou [${domino[0]},${domino[1]}]`);
                    this.checkRoundEnd();
                }
            } else {
                round.aiPassed = true;
                round.history.push(`AI passou`);
                this.checkRoundEnd();
            }
        } else {
            const domino = this.selectAIMove(playable);
            round.aiHand = round.aiHand.filter(d => 
                !(d[0] === domino[0] && d[1] === domino[1])
            );
            round.mesa.push({
                domino,
                owner: 'ai',
                rotated: Math.random() > 0.5
            });
            round.history.push(`AI jogou [${domino[0]},${domino[1]}]`);
            this.checkRoundEnd();
        }
        
        this.render();
    }

    selectAIMove(playable) {
        // IA simples: joga o primeiro dominó disponível
        // Poderia ser mais sofisticada
        return playable[0];
    }

    playerDrawDomino() {
        const round = this.currentRound;
        if (round.boneyard.length === 0) {
            this.playerPass();
            return;
        }
        
        const drawn = round.boneyard.pop();
        round.playerHand.push(drawn);
        round.history.push(`Jogador puxou do boneyard`);
        
        // Verifica se pode jogar
        const playable = this.getPlayableDominoes(round.playerHand);
        if (playable.length === 0) {
            this.playerPass();
        }
        
        this.render();
    }

    playerPass() {
        const round = this.currentRound;
        round.playerPassed = true;
        round.history.push(`Jogador passou`);
        this.checkRoundEnd();
        this.render();
    }

    checkRoundEnd() {
        const round = this.currentRound;
        
        // Verifica se alguém ganhou (sem dominós na mão)
        if (round.playerHand.length === 0) {
            this.endRound('player');
            return;
        }
        if (round.aiHand.length === 0) {
            this.endRound('ai');
            return;
        }
        
        // Verifica se ambos passaram
        if (round.aiPassed && round.playerPassed) {
            this.endRound('draw');
            return;
        }
    }

    endRound(winner) {
        const round = this.currentRound;
        
        let playerPoints = round.playerHand.reduce((sum, d) => sum + d[0] + d[1], 0);
        let aiPoints = round.aiHand.reduce((sum, d) => sum + d[0] + d[1], 0);
        
        let roundWinner = winner;
        if (winner === 'player') {
            this.playerTotalScore += aiPoints;
        } else if (winner === 'ai') {
            this.aiTotalScore += playerPoints;
        } else {
            // Draw - ninguém marca
        }
        
        round.winner = roundWinner;
        round.playerPoints = playerPoints;
        round.aiPoints = aiPoints;
        
        this.showStatus(roundWinner, playerPoints, aiPoints);
    }

    showStatus(winner, playerPoints, aiPoints) {
        const modal = document.getElementById('statusModal');
        const title = document.getElementById('statusTitle');
        const message = document.getElementById('statusMessage');
        
        if (winner === 'player') {
            title.textContent = '🎉 Você Venceu!';
            message.textContent = `A IA ficou com ${playerPoints} pontos não marcados.`;
        } else if (winner === 'ai') {
            title.textContent = '🤖 IA Venceu!';
            message.textContent = `Você ficou com ${aiPoints} pontos não marcados.`;
        } else {
            title.textContent = '🤝 Empate';
            message.textContent = 'Ambos passaram consecutivamente.';
        }
        
        modal.classList.add('show');
        
        document.getElementById('statusBtn').onclick = () => {
            modal.classList.remove('show');
            
            if (this.playerTotalScore >= this.gameGoal) {
                this.endGame('player');
            } else if (this.aiTotalScore >= this.gameGoal) {
                this.endGame('ai');
            } else {
                this.nextRound();
            }
        };
    }

    nextRound() {
        this.initializeRound();
        this.render();
    }

    endGame(winner) {
        const modal = document.getElementById('statusModal');
        const title = document.getElementById('statusTitle');
        const message = document.getElementById('statusMessage');
        
        if (winner === 'player') {
            title.textContent = '👑 Você Ganhou o Jogo!';
            message.textContent = `Sua pontuação: ${this.playerTotalScore} × IA: ${this.aiTotalScore}`;
        } else {
            title.textContent = '🤖 IA Ganhou o Jogo!';
            message.textContent = `IA: ${this.aiTotalScore} × Sua pontuação: ${this.playerTotalScore}`;
        }
        
        document.getElementById('statusBtn').textContent = 'Novo Jogo';
        document.getElementById('statusBtn').onclick = () => {
            location.reload();
        };
        
        modal.classList.add('show');
    }

    render() {
        this.renderScoreboard();
        this.renderMesa();
        this.renderBoneyard();
        this.renderPlayerHand();
    }

    renderScoreboard() {
        document.getElementById('playerScore').textContent = this.playerTotalScore;
        document.getElementById('aiScore').textContent = this.aiTotalScore;
    }

    renderMesa() {
        const mesaEl = document.getElementById('mesa');
        mesaEl.innerHTML = '';
        
        const round = this.currentRound;
        round.mesa.forEach((piece, idx) => {
            const domino = this.createDominoElement(piece.domino, piece.rotated);
            mesaEl.appendChild(domino);
        });
    }

    renderBoneyard() {
        const boneyardGrid = document.getElementById('boneyardGrid');
        boneyardGrid.innerHTML = '';
        
        const round = this.currentRound;
        const totalSlots = 28; // 28 dominós
        
        for (let i = 0; i < totalSlots; i++) {
            const slot = document.createElement('div');
            slot.className = 'boneyard-slot';
            
            if (i < round.boneyard.length) {
                slot.classList.add('filled');
                slot.onclick = () => this.playerDrawDomino();
            }
            
            boneyardGrid.appendChild(slot);
        }
    }

    renderPlayerHand() {
        const handEl = document.getElementById('playerHand');
        handEl.innerHTML = '';
        
        const round = this.currentRound;
        const playable = this.getPlayableDominoes(round.playerHand);
        
        round.playerHand.forEach(domino => {
            const el = this.createDominoElement(domino);
            
            if (playable.includes(domino)) {
                el.classList.add('playable');
                el.onclick = () => {
                    this.playDomino(domino);
                    this.render();
                };
            } else {
                el.classList.add('not-playable');
            }
            
            handEl.appendChild(el);
        });
        
        // Update buttons
        const drawBtn = document.getElementById('drawBtn');
        const passBtn = document.getElementById('passBtn');
        
        drawBtn.disabled = round.boneyard.length === 0;
        passBtn.disabled = playable.length > 0;
    }

    createDominoElement(domino, rotated = false) {
        const el = document.createElement('div');
        el.className = `domino ${rotated ? 'rotated' : ''}`;
        
        const [top, bottom] = domino;
        
        el.innerHTML = `
            <div class="domino-half">
                ${this.createPips(top)}
            </div>
            <div class="domino-half">
                ${this.createPips(bottom)}
            </div>
        `;
        
        return el;
    }

    createPips(count) {
        let html = '';
        const patterns = {
            0: [],
            1: [[1,1]],
            2: [[0,0], [2,2]],
            3: [[0,0], [1,1], [2,2]],
            4: [[0,0], [0,2], [2,0], [2,2]],
            5: [[0,0], [0,2], [1,1], [2,0], [2,2]],
            6: [[0,0], [0,1], [0,2], [2,0], [2,1], [2,2]]
        };
        
        const positions = patterns[count] || [];
        for (let i = 0; i < 9; i++) {
            if (positions.some(p => p[0] * 3 + p[1] === i)) {
                html += '<div class="domino-pip"></div>';
            } else {
                html += '<div></div>';
            }
        }
        
        return html;
    }

    setupEventListeners() {
        document.getElementById('drawBtn').onclick = () => this.playerDrawDomino();
        document.getElementById('passBtn').onclick = () => this.playerPass();
        
        document.getElementById('prevBtn').onclick = () => {
            if (this.currentRound > 0) {
                this.currentRound--;
                this.render();
            }
        };
        
        document.getElementById('nextBtn').onclick = () => {
            if (this.currentRound < this.rounds.length - 1) {
                this.currentRound++;
                this.render();
            }
        };
    }
}

// Registrar Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(err => 
        console.log('SW registration failed:', err)
    );
}

// Inicializar jogo
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new DominoGame();
});
  
