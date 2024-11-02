class BaccaratTrainer {
    constructor() {
        this.stats = {
            correct: 0,
            incorrect: 0,
            hands: 0
        };
        this.currentHand = {
            player: [],
            banker: [],
            playerThirdCard: null,
            bankerThirdCard: null
        };
        this.currentStep = 'natural';
        this.dealNewHand();
    }

    dealNewHand() {
        this.currentHand = {
            player: [this.drawRandomCard(), this.drawRandomCard()],
            banker: [this.drawRandomCard(), this.drawRandomCard()],
            playerThirdCard: null,
            bankerThirdCard: null
        };
        this.currentStep = 'natural';
        this.stats.hands++;
        this.updateStats();
        this.displayCards();
        this.showNaturalDecision();
    }

    drawRandomCard() {
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K'];
        const suit = suits[Math.floor(Math.random() * suits.length)];
        const value = values[Math.floor(Math.random() * values.length)];
        return { suit, value, img: `assets/${suit}${value}.png` };
    }

    displayCards() {
        // Display Player cards
        this.currentHand.player.forEach((card, index) => {
            const slot = document.getElementById(`player-card-${index + 1}`);
            slot.innerHTML = `<img src="${card.img}" alt="${card.value} of ${card.suit}">`;
        });
        document.getElementById('player-card-3').innerHTML = '';

        // Display Banker cards
        this.currentHand.banker.forEach((card, index) => {
            const slot = document.getElementById(`banker-card-${index + 1}`);
            slot.innerHTML = `<img src="${card.img}" alt="${card.value} of ${card.suit}">`;
        });
        document.getElementById('banker-card-3').innerHTML = '';
    }

    calculateHandValue(hand) {
        return hand.reduce((total, card) => {
            let value = card.value;
            if (value === 'T' || value === 'J' || value === 'Q' || value === 'K') {
                return total + 0;
            } else if (value === 'A') {
                return total + 1;
            } else {
                return total + parseInt(value);
            }
        }, 0) % 10;
    }

    showNaturalDecision() {
        const prompt = document.getElementById('prompt');
        const options = document.getElementById('options');
        const playerValue = this.calculateHandValue(this.currentHand.player);
        const bankerValue = this.calculateHandValue(this.currentHand.banker);

        prompt.textContent = "Is there a natural win?";
        options.innerHTML = `
            <button class="option-btn" onclick="game.checkNatural('player')">Natural Player Win</button>
            <button class="option-btn" onclick="game.checkNatural('banker')">Natural Banker Win</button>
            <button class="option-btn" onclick="game.checkNatural('tie')">Natural Tie</button>
            <button class="option-btn" onclick="game.checkNatural('none')">No Naturals</button>
        `;
    }

    checkNatural(choice) {
        const playerValue = this.calculateHandValue(this.currentHand.player);
        const bankerValue = this.calculateHandValue(this.currentHand.banker);
        const isNatural = playerValue >= 8 || bankerValue >= 8;
        let correctAnswer = 'none';

        if (isNatural) {
            if (playerValue === bankerValue) correctAnswer = 'tie';
            else if (playerValue > bankerValue) correctAnswer = 'player';
            else correctAnswer = 'banker';
        }

        if (choice === correctAnswer) {
            this.showFeedback(true, "Correct!");
            this.stats.correct++;
            if (isNatural) {
                setTimeout(() => this.dealNewHand(), 1500);
            } else {
                this.currentStep = 'playerDraw';
                setTimeout(() => this.showPlayerDrawDecision(), 1500);
            }
        } else {
            this.showFeedback(false, "Incorrect. Try again!");
            this.stats.incorrect++;
        }
        this.updateStats();
    }

    showPlayerDrawDecision() {
        const playerValue = this.calculateHandValue(this.currentHand.player);
        const prompt = document.getElementById('prompt');
        const options = document.getElementById('options');

        prompt.textContent = "Should the Player draw a third card?";
        options.innerHTML = `
            <button class="option-btn" onclick="game.checkPlayerDraw(true)">Draw Card</button>
            <button class="option-btn" onclick="game.checkPlayerDraw(false)">Stand</button>
        `;
    }

    checkPlayerDraw(shouldDraw) {
        const playerValue = this.calculateHandValue(this.currentHand.player);
        const correctDraw = playerValue <= 5;

        if (shouldDraw === correctDraw) {
            this.showFeedback(true, "Correct!");
            this.stats.correct++;
            if (shouldDraw) {
                this.currentHand.playerThirdCard = this.drawRandomCard();
                document.getElementById('player-card-3').innerHTML = 
                    `<img src="${this.currentHand.playerThirdCard.img}" alt="${this.currentHand.playerThirdCard.value} of ${this.currentHand.playerThirdCard.suit}">`;
            }
            this.currentStep = 'bankerDraw';
            setTimeout(() => this.showBankerDrawDecision(), 1500);
        } else {
            this.showFeedback(false, "Incorrect. Remember: Player draws on 0-5, stands on 6-7");
            this.stats.incorrect++;
        }
        this.updateStats();
    }

    showBankerDrawDecision() {
        const bankerValue = this.calculateHandValue(this.currentHand.banker);
        const prompt = document.getElementById('prompt');
        const options = document.getElementById('options');

        prompt.textContent = "Should the Banker draw a third card?";
        options.innerHTML = `
            <button class="option-btn" onclick="game.checkBankerDraw(true)">Draw Card</button>
            <button class="option-btn" onclick="game.checkBankerDraw(false)">Stand</button>
        `;
    }

    checkBankerDraw(shouldDraw) {
        const bankerValue = this.calculateHandValue(this.currentHand.banker);
        let correctDraw = false;

        if (this.currentHand.playerThirdCard === null) {
            correctDraw = bankerValue <= 5;
        } else {
            const playerThirdValue = this.currentHand.playerThirdCard.value;
            const pValue = playerThirdValue === 'T' || playerThirdValue === 'J' || 
                          playerThirdValue === 'Q' || playerThirdValue === 'K' ? 0 : 
                          playerThirdValue === 'A' ? 1 : parseInt(playerThirdValue);

            if (bankerValue <= 2) correctDraw = true;
            else if (bankerValue === 3 && pValue !== 8) correctDraw = true;
            else if (bankerValue === 4 && (pValue >= 2 && pValue <= 7)) correctDraw = true;
            else if (bankerValue === 5 && (pValue >= 4 && pValue <= 7)) correctDraw = true;
            else if (bankerValue === 6 && (pValue === 6 || pValue === 7)) correctDraw = true;
        }

        if (shouldDraw === correctDraw) {
            this.showFeedback(true, "Correct!");
            this.stats.correct++;
            if (shouldDraw) {
                this.currentHand.bankerThirdCard = this.drawRandomCard();
                document.getElementById('banker-card-3').innerHTML = 
                    `<img src="${this.currentHand.bankerThirdCard.img}" alt="${this.currentHand.bankerThirdCard.value} of ${this.currentHand.bankerThirdCard.suit}">`;
            }
            setTimeout(() => this.showFinalDecision(), 1500);
        } else {
            this.showFeedback(false, "Incorrect. Check the Banker drawing rules.");
            this.stats.incorrect++;
        }
        this.updateStats();
    }

    showFinalDecision() {
        const prompt = document.getElementById('prompt');
        const options = document.getElementById('options');

        prompt.textContent = "What is the final outcome?";
        options.innerHTML = `
            <button class="option-btn" onclick="game.checkFinalOutcome('player')">Player Wins</button>
            <button class="option-btn" onclick="game.checkFinalOutcome('banker')">Banker Wins</button>
            <button class="option-btn" onclick="game.checkFinalOutcome('tie')">Tie</button>
        `;
    }

    checkFinalOutcome(choice) {
        const playerFinal = this.calculateFinalValue('player');
        const bankerFinal = this.calculateFinalValue('banker');
        let correctOutcome;

        if (playerFinal === bankerFinal) correctOutcome = 'tie';
        else if (playerFinal > bankerFinal) correctOutcome = 'player';
        else correctOutcome = 'banker';

        if (choice === correctOutcome) {
            this.showFeedback(true, `Correct! Final scores - Player: ${playerFinal}, Banker: ${bankerFinal}`);
            this.stats.correct++;
            setTimeout(() => this.dealNewHand(), 2000);
        } else {
            this.showFeedback(false, "Incorrect. Try again!");
            this.stats.incorrect++;
        }
        this.updateStats();
    }

    calculateFinalValue(side) {
        const hand = [...this.currentHand[side]];
        if (this.currentHand[side + 'ThirdCard']) {
            hand.push(this.currentHand[side + 'ThirdCard']);
        }
        return this.calculateHandValue(hand);
    }

    showFeedback(isCorrect, message) {
        const feedback = document.getElementById('feedback');
        feedback.textContent = message;
        feedback.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
    }

    updateStats() {
        document.getElementById('correct-count').textContent = this.stats.correct;
        document.getElementById('incorrect-count').textContent = this.stats.incorrect;
        document.getElementById('hands-count').textContent = this.stats.hands;
    }
}

// Initialize the game
const game = new BaccaratTrainer();
