// Dominó Game Logic - Motor Atualizado
class DominoGame {
    constructor() {
        // Estado do jogo
        this.rounds = [];
        this.currentRound = null; // Agora guarda o objeto do round ativo
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
            boardEnds: null, // Regista as pontas { left: num, right: num }
            aiPassed: false,
            playerPassed: false,
            ended: false,
            currentPlayer: 'player',
            history: []
        };
        
        this.rounds.push(this.currentRound);
    }

    // Identifica onde a peça pode entrar
    getValidPlacements(domino) {
        const round = this.currentRound;
        if (round.mesa.length === 0) {
            return [{ side: 'first' }];
        }
        
        const ends = round.boardEnds;
        const placements = [];
        
        if (domino[0] === ends.right || domino[1] === ends.right) {
            placements.push({ side: 'right' });
        }
        if (domino[0] === ends.left || domino[1] === ends.left) {
            placements.push({ side: 'left' });
        }
        
        return placements;
    }

    canPlayDomino(domino) {
        return this.getValidPlacements(domino).length > 0;
    }

    getPlayableDominoes(hand) {
        return hand.filter(d => this.canPlayDomino(d));
    }

    // Ação centralizada para jogar uma peça (Jogador ou IA)
    playPiece(domino, owner) {
        const round = this.currentRound;
        if (round.ended) return false;

        let placements = this.getValidPlacements(domino);
        if (placements.length === 0) return false;

        // Remover da mão correta
        if (owner === 'player') {
            round.playerHand = round.playerHand.filter(d => !(d[0] === domino[0] && d[1] === domino[1]));
        } else {
            round.aiHand = round.aiHand.filter(d => !(d[0] === domino[0] && d[1] === domino[1]));
        }

        const play = placements[0]; // Escolhe o primeiro encaixe válido
        let displayDomino = [...domino];
        let isDouble = domino[0] === domino[1];

        // Lógica de alinhamento visual e atualização das pontas
        if (play.side === 'first') {
            round.boardEnds = { left: domino[0], right: domino[1] };
        } else if (play.side === 'right') {
            if (domino[0] === round.boardEnds.right) {
                round.boardEnds.right = domino[1];
                displayDomino = [domino[0], domino[1]];
            } else {
                round.boardEnds.right = domino[0];
                displayDomino = [domino[1], domino[0]]; // Inverte para encaixar
            }
        } else if (play.side === 'left') {
            if (domino[1] === round.boardEnds.left) {
                round.boardEnds.left = domino[0];
                displayDomino = [domino[0], domino[1]];
            } else {
                round.boardEnds.left = domino[1];
                displayDomino = [domino[1], domino[0]]; // Inverte para encaixar
            }
        }

        const pieceObj = { 
            domino: displayDomino, 
            owner, 
            rotated: !isDouble // Duplos ficam de pé, normais deitados (fila indiana)
        };

        if (play.side === 'first' || play.side === 'right') {
            round.mesa.push(pieceObj);
        } else {
            round.mesa.unshift(pieceObj); // Adiciona na frente da mesa visualmente
        }

        round.history.push(`${owner} jogou [${domino[0]},${domino[1]}]`);

        // Reseta o status de Pass e checa fim de jogo
        if (owner === 'player') round.playerPassed = false;
        if (owner === 'ai') round.aiPassed = false;
        
        this.checkRoundEnd();

        // Se foi o jogador, ativa o turno da IA
        if (!round.ended && owner === 'player') {
            setTimeout(() => this.aiPlay(), 600);
        }

        return true;
    }

    aiPlay() {
        const round = this.currentRound;
        if (round.ended) return;

        let playable = this.getPlayableDominoes(round.aiHand);
        
        // IA tenta puxar até encontrar peça válida ou o boneyard esgotar
        while (playable.length === 0 && round.boneyard.length > 0) {
            const drawn = round.boneyard.pop();
            round.aiHand.push(drawn);
            round.history.push(`AI puxou do boneyard`);
            playable = this.getPlayableDominoes(round.aiHand);
        }

        if (playable.length > 0) {
            // IA escolhe a primeira peça jogável
            const domino = playable[0]; 
            this.playPiece(domino, 'ai');
        } else {
            // Se não conseguiu nada, passa a vez
            round.aiPassed = true;
            round.history.push(`AI passou`);
            this.checkRoundEnd();
        }
        
        this.render();
    }

    playerDrawDomino() {
        const round = this.currentRound;
        if (round.boneyard.length === 0 || round.ended) return;
        
        const drawn = round.boneyard.pop();
        round.playerHand.push(drawn);
        round.history.push(`Jogador puxou do boneyard`);
        
        this.render();
    }

    playerPass() {
        const round = this.currentRound;
        if (round.ended) return;

        round.playerPassed = true;
        round.history.push(`Jogador passou`);
        this.checkRoundEnd();
        
        if (!round.ended) {
            setTimeout(() => this.aiPlay(), 500);
        }
        this.render();
    }

    checkRoundEnd() {
        const round = this.currentRound;
        if (round.ended) return;
        
        // Bateu (Alguém ficou sem peças)
        if (round.playerHand.length === 0) {
            round.ended = true;
            this.endRound('player');
            return;
        }
        if (round.aiHand.length === 0) {
            round.ended = true;
            this.endRound('ai');
            return;
        }
        
        // Jogo trancado (Ambos passaram na mesma rodada sem jogar)
        if (round.aiPassed && round.playerPassed) {
            round.ended = true;
            this.endRound('draw');
            return;
        }
    }

    endRound(winner) {
        const round = this.currentRound;
        
        let playerPoints = round.playerHand.reduce((sum, d) => sum + d[0] + d[1], 0);
        let aiPoints = round.aiHand.reduce((sum, d) => sum + d[0] + d[1], 0);
        
        let roundWinner = winner;
        
        // Se trancou, ganha quem tem MENOS pontos na mão
        if (winner === 'draw') {
            if (playerPoints < aiPoints) roundWinner = 'player';
            else if (aiPoints < playerPoints) roundWinner = 'ai';
            else roundWinner = 'tie';
        }

        // Soma os pontos do perdedor ao vencedor
        if (roundWinner === 'player') {
            this.playerTotalScore += aiPoints;
        } else if (roundWinner === 'ai') {
            this.aiTotalScore += playerPoints;
        }
        
        this.showStatus(roundWinner, playerPoints, aiPoints);
    }

    showStatus(winner, playerPoints, aiPoints) {
        const modal = document.getElementById('statusModal');
        const title = document.getElementById('statusTitle');
        const message = document.getElementById('statusMessage');
        const btn = document.getElementById('statusBtn');
        
        if (winner === 'player') {
            title.textContent = '🎉 Você Venceu a Rodada!';
            message.textContent = `A IA ficou com peças na mão.\n+${aiPoints} pontos para você.`;
        } else if (winner === 'ai') {
            title.textContent = '🤖 IA Venceu a Rodada!';
            message.textContent = `Você ficou com peças na mão.\n+${playerPoints} pontos para a IA.`;
        } else {
            title.textContent = '🤝 Empate Absoluto';
            message.textContent = 'Jogo trancado e pontos iguais. Ninguém pontua.';
        }
        
        modal.classList.add('show');
        
        // Resetamos a função do botão dinamicamente
        btn.onclick = () => {
            modal.classList.remove('show');
            
            // Verifica se alguém atingiu a meta do jogo
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
        const btn = document.getElementById('statusBtn');
        
        if (winner === 'player') {
            title.textContent = '👑 VOCÊ GANHOU O JOGO!';
            message.textContent = `Sua pontuação: ${this.playerTotalScore} × IA: ${this.aiTotalScore}`;
        } else {
            title.textContent = '☠️ A IA GANHOU O JOGO!';
            message.textContent = `IA: ${this.aiTotalScore} × Sua pontuação: ${this.playerTotalScore}`;
        }
        
        btn.textContent = 'Reiniciar Jogo';
        btn.onclick = () => {
            location.reload(); // Recarrega do zero com total segurança
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
        round.mesa.forEach(piece => {
            const domino = this.createDominoElement(piece.domino, piece.rotated);
            mesaEl.appendChild(domino);
        });
    }

    renderBoneyard() {
        const boneyardGrid = document.getElementById('boneyardGrid');
        boneyardGrid.innerHTML = '';
        
        const round = this.currentRound;
        const totalSlots = 28;
        
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
            
            if (playable.some(p => p[0] === domino[0] && p[1] === domino[1])) {
                el.classList.add('playable');
                el.onclick = () => {
                    this.playPiece(domino, 'player');
                    this.render();
                };
            } else {
                el.classList.add('not-playable');
            }
            
            handEl.appendChild(el);
        });
        
        // Regras restritas dos botões
        const drawBtn = document.getElementById('drawBtn');
        const passBtn = document.getElementById('passBtn');
        
        // Só compra se NÃO tiver jogadas E a reserva não estiver vazia
        drawBtn.disabled = playable.length > 0 || round.boneyard.length === 0;
        
        // Só passa a vez se NÃO tiver jogadas E a reserva estiver VAZIA
        passBtn.disabled = playable.length > 0 || round.boneyard.length > 0;
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
        
        // Os botões prev/next foram desativados para não corromper o histórico da partida
        const prevBtn = document.getElementById('prevBtn');
        if(prevBtn) prevBtn.onclick = () => console.log('Modo visualizador desativado em jogo.');
        const nextBtn = document.getElementById('nextBtn');
        if(nextBtn) nextBtn.onclick = () => console.log('Modo visualizador desativado em jogo.');
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
        
