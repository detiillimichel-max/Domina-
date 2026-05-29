# 🎮 Jogo de Dominó - PWA

Um jogo interativo de dominó desenvolvido em **HTML5 + CSS3 + Vanilla JavaScript** com design moderno glassmorphism, pronto para ser instalado como PWA (Progressive Web App).

## 🎯 Características

✨ **Interface Moderna**
- Design glassmorphism com gradientes cyan e coral
- Tipografia DM Sans
- Responsivo para mobile e desktop
- Animações suaves

🎮 **Gameplay Completo**
- Jogo de dominó com regras clássicas
- IA inteligente
- Sistema de pontuação por rodadas
- Objetivo de 250 pontos
- Boneyard (peças não distribuídas)
- Histórico de moves

📱 **PWA Ready**
- Instalável como app nativo
- Funciona offline
- Service Worker para cache
- Manifest com ícones SVG
- Suporte a push notifications

## 📁 Estrutura de Arquivos

```
domino-game/
├── index.html       # HTML principal
├── style.css        # Estilos (CSS3 com variáveis)
├── app.js           # Lógica do jogo (classe DominoGame)
├── manifest.json    # PWA manifest
├── sw.js            # Service Worker
└── README.md        # Este arquivo
```

## 🚀 Deploy no GitHub Pages

### 1️⃣ Clonar ou criar seu repositório

```bash
# Criar novo repo
git init meu-domino-game
cd meu-domino-game

# Ou clonar
git clone https://github.com/seu-usuario/domino-game.git
cd domino-game
```

### 2️⃣ Adicionar os arquivos

Copie todos os arquivos da pasta `domino-game/` para a raiz do seu repositório:

```
.
├── index.html
├── style.css
├── app.js
├── manifest.json
├── sw.js
└── README.md
```

### 3️⃣ Criar branch `gh-pages`

```bash
git add .
git commit -m "Initial commit: Dominó Game PWA"
git branch gh-pages
git checkout gh-pages
git push origin gh-pages
```

### 4️⃣ Configurar no GitHub

1. Acesse **Settings** → **Pages**
2. Source: `Deploy from a branch`
3. Branch: `gh-pages`
4. Folder: `/ (root)`
5. Save

Seu jogo estará disponível em:
```
https://seu-usuario.github.io/domino-game/
```

## 🛠️ Desenvolvimento Local

### Servir com Python
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Acesse: `http://localhost:8000/domino-game/`

### Servir com Node.js
```bash
npx http-server
```

### Servir com Live Server (VSCode)
1. Instale a extensão "Live Server"
2. Right-click em `index.html`
3. "Open with Live Server"

## 📋 Como Jogar

1. **Seu turno**: Clique em um dominó verde (jogável)
2. **Sem jogada**: Clique em "Puxar" ou clique no Boneyard
3. **Passar**: Clique em "Passar" (aparece quando sem jogadas)
4. **IA**: Joga automaticamente após seu move
5. **Objetivo**: Atingir 250 pontos

### Regras
- Dominó clássico com 28 peças (0-0 até 6-6)
- Encaixe por pips iguais nas extremidades
- Mão inicial: 7 dominós para cada jogador
- Quem acaba primeiro marca os pontos da mão oposta
- Ganha quem atingir 250 pontos

## 🎨 Customização

### Cores
Edite as variáveis CSS em `style.css`:

```css
:root {
    --primary: #00d4ff;      /* Cyan */
    --accent: #ff7a5c;        /* Coral */
    --dark-bg: #0a0e27;       /* Dark blue */
    /* ... */
}
```

### Objetivo de Pontos
Em `app.js`, na classe `DominoGame`:

```javascript
this.gameGoal = 250;  // Alterar para seu valor
```

### IA
Altere o método `selectAIMove()` em `app.js` para implementar estratégias diferentes.

## 📱 Instalar no Celular

### iOS
1. Abra em Safari
2. Toque no ícone de compartilhamento
3. "Adicionar à Tela de Início"

### Android
1. Abra em Chrome
2. Menu → "Instalar app"
3. Ou procure o botão de install na URL bar

## 🔧 Requisitos

- Browser moderno com suporte a:
  - ES6+ (Classes, Arrow Functions)
  - CSS Grid e Flexbox
  - Service Workers
  - Local Storage (opcional)

## ⚡ Performance

- **Tamanho total**: ~35KB (HTML + CSS + JS)
- **Load time**: < 1s em 4G
- **Offline**: Totalmente funcional sem internet

## 🐛 Troubleshooting

### Service Worker não registra
- Abra DevTools → Application → Service Workers
- Verifique se está em HTTPS (ou localhost)

### Manifest não carrega
- Verifique o path em `index.html`: `<link rel="manifest" href="manifest.json">`
- Confirm MIME type: `application/manifest+json`

### Estilos não aparecem
- Clear cache do navegador
- Ctrl+Shift+R (hard refresh)

## 📄 Licença

MIT License - Sinta-se livre para usar, modificar e distribuir!

## 🤝 Contribuições

Sugestões de melhorias:
- [ ] Multiplayer online
- [ ] Diferentes níveis de dificuldade IA
- [ ] Temas customizáveis
- [ ] Leaderboard local
- [ ] Estatísticas de jogo

---

**Desenvolvido com ❤️ em HTML5, CSS3 e JavaScript puro**

Divirta-se jogando! 🎮✨
