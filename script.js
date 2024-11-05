class BaccaratTrainer {
    constructor() {
        this.stats = {
            correct: 0,
            incorrect: 0,
            hands: 0,
            peeks: 0
        };
        this.currentHand = {
            player: [],
            banker: [],
            playerThirdCard: null,
            bankerThirdCard: null
        };
        this.currentStep = 'natural';
        this.currentCardSet = 'assets'; // Track current card set
        this.initializeButtons();
        this.initializeRulesSection();
        this.updateCardSetIndicator();
        this.dealNewHand(true);
    }

    initializeButtons() {
        const buttons = ['btn-1', 'btn-2', 'btn-3', 'btn-4'];
        buttons.forEach(btnId => {
            const btn = document.getElementById(btnId);
            btn.onclick = () => this.handleButtonClick(btnId);
        });

        // Make the card set switcher clickable
        const switcher = document.querySelector('.card-set-switcher');
        if (switcher) {
            switcher.onclick = () => this.switchCardSet();
        }
    }

    initializeRulesSection() {
        const rulesSection = document.getElementById('rules-section');
        // Ensure rules start collapsed
        rulesSection.removeAttribute('open');
        
        // Track when rules are viewed
        rulesSection.addEventListener('toggle', (event) => {
            if (rulesSection.open) {
                this.stats.peeks++;
                this.updateStats();
            }
        });
    }

    // New method to update the card set indicator
    updateCardSetIndicator() {
        const indicator = document.getElementById('current-card-set');
        if (indicator) {
            indicator.textContent = this.currentCardSet === 'assets' ? 'Style 1' : 'Style 2';
        }
    }

    // Updated method to switch card sets
    switchCardSet() {
        this.currentCardSet = this.currentCardSet === 'assets' ? 'assets2' : 'assets';
        this.updateCardSetIndicator();
        // Redeal hand to show new card faces
        this.dealNewHand(false);
    }

    handleButtonClick(btnId) {
        switch(this.currentStep) {
            case 'natural':
                const naturalChoices = {
                    'btn-1': 'player',
                    'btn-2': 'banker',
                    'btn-3': 'tie',
                    'btn-4': 'none'
                };
                this.checkNatural(naturalChoices[btnId]);
                break;
            case 'playerDraw':
                const drawChoices = {
                    'btn-1': true,  // Draw
                    'btn-2': false  // Stand
                };
                if (btnId in drawChoices) {
                    this.checkPlayerDraw(drawChoices[btnId]);
                }
                break;
            case 'bankerDraw':
                const bankerChoices = {
                    'btn-1': true,  // Draw
                    'btn-2': false  // Stand
                };
                if (btnId in bankerChoices) {
                    this.checkBankerDraw(bankerChoices[btnId]);
                }
                break;
            case 'final':
                const finalChoices = {
                    'btn-1': 'player',
                    'btn-2': 'banker',
                    'btn-3': 'tie'
                };
                if (btnId in finalChoices) {
                    this.checkFinalOutcome(finalChoices[btnId]);
                }
                break;
        }
    }

    clearFeedback() {
        const feedback = document.getElementById('feedback');
        feedback.textContent = '';
        feedback.className = 'feedback';
    }

    updateButtonStates(activeButtons, labels) {
        // First disable all buttons during transition
        ['btn-1', 'btn-2', 'btn-3', 'btn-4'].forEach(btnId => {
            const btn = document.getElementById(btnId);
            btn.disabled = true;
        });

        // Clear feedback when updating buttons for new step
        this.clearFeedback();

        // Then update states after a short delay
        setTimeout(() => {
            ['btn-1', 'btn-2', 'btn-3', 'btn-4'].forEach((btnId, index) => {
                const btn = document.getElementById(btnId);
                btn.disabled = !activeButtons.includes(btnId);
                btn.textContent = labels[index] || '';
                // Keep button visible but disabled if no label
                if (!labels[index]) {
                    btn.disabled = true;
                }
            });
        }, 100);
    }

    dealNewHand(isNewHand = true) {
        // Collapse rules at start of new hand
        const rulesSection = document.getElementById('rules-section');
        rulesSection.removeAttribute('open');

        this.currentHand = {
            player: [this.drawRandomCard(), this.drawRandomCard()],
            banker: [this.drawRandomCard(), this.drawRandomCard()],
            playerThirdCard: null,
            bankerThirdCard: null
        };
        this.currentStep = 'natural';
        if (isNewHand) {
            this.stats.hands++;
        }
        this.updateStats();
        this.displayCards();
        this.showNaturalDecision();
    }

    drawRandomCard() {
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K'];
        const suit = suits[Math.floor(Math.random() * suits.length)];
        const value = values[Math.floor(Math.random() * values.length)];
        return { suit, value, img: `${this.currentCardSet}/${suit}${value}.png` };
    }

    displayCards() {
        // Reset all card slots
        for (let i = 1; i <= 3; i++) {
            const playerSlot = document.getElementById(`player-card-${i}`);
            const bankerSlot = document.getElementById(`banker-card-${i}`);
            playerSlot.innerHTML = '';
            bankerSlot.innerHTML = '';
            playerSlot.classList.remove('filled');
            bankerSlot.classList.remove('filled');
        }

        // Display Player cards
        this.currentHand.player.forEach((card, index) => {
            const slot = document.getElementById(`player-card-${index + 1}`);
            slot.innerHTML = `<img src="${card.img}" alt="${card.value} of ${card.suit}">`;
            slot.classList.add('filled');
        });

        // Display Banker cards
        this.currentHand.banker.forEach((card, index) => {
            const slot = document.getElementById(`banker-card-${index + 1}`);
            slot.innerHTML = `<img src="${card.img}" alt="${card.value} of ${card.suit}">`;
            slot.classList.add('filled');
        });

        // Display third cards if they exist
        if (this.currentHand.playerThirdCard) {
            const slot = document.getElementById('player-card-3');
            slot.innerHTML = `<img src="${this.currentHand.playerThirdCard.img}" alt="${this.currentHand.playerThirdCard.value} of ${this.currentHand.playerThirdCard.suit}">`;
            slot.classList.add('filled');
        }

        if (this.currentHand.bankerThirdCard) {
            const slot = document.getElementById('banker-card-3');
            slot.innerHTML = `<img src="${this.currentHand.bankerThirdCard.img}" alt="${this.currentHand.bankerThirdCard.value} of ${this.currentHand.bankerThirdCard.suit}">`;
            slot.classList.add('filled');
        }
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
        prompt.textContent = "Is there a natural win?";
        this.updateButtonStates(
            ['btn-1', 'btn-2', 'btn-3', 'btn-4'],
            ['PLAYER WIN', 'BANKER WIN', 'TIE', 'NO NATURALS']
        );
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
                setTimeout(() => this.dealNewHand(true), 1500);
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
        const prompt = document.getElementById('prompt');
        prompt.textContent = "Should the Player draw a third card?";
        this.updateButtonStates(
            ['btn-1', 'btn-2'],
            ['DRAW', 'STAND', '', '']
        );
    }

    checkPlayerDraw(shouldDraw) {
        const playerValue = this.calculateHandValue(this.currentHand.player);
        const correctDraw = playerValue <= 5;

        if (shouldDraw === correctDraw) {
            this.showFeedback(true, "Correct!");
            this.stats.correct++;
            if (shouldDraw) {
                this.currentHand.playerThirdCard = this.drawRandomCard();
                const slot = document.getElementById('player-card-3');
                slot.innerHTML = `<img src="${this.currentHand.playerThirdCard.img}" alt="${this.currentHand.playerThirdCard.value} of ${this.currentHand.playerThirdCard.suit}">`;
                slot.classList.add('filled');
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
        const prompt = document.getElementById('prompt');
        prompt.textContent = "Should the Banker draw a third card?";
        this.updateButtonStates(
            ['btn-1', 'btn-2'],
            ['DRAW', 'STAND', '', '']
        );
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
                const slot = document.getElementById('banker-card-3');
                slot.innerHTML = `<img src="${this.currentHand.bankerThirdCard.img}" alt="${this.currentHand.bankerThirdCard.value} of ${this.currentHand.bankerThirdCard.suit}">`;
                slot.classList.add('filled');
            }
            this.currentStep = 'final';
            setTimeout(() => this.showFinalDecision(), 1500);
        } else {
            this.showFeedback(false, "Incorrect. Check the Banker drawing rules.");
            this.stats.incorrect++;
        }
        this.updateStats();
    }

    showFinalDecision() {
        const prompt = document.getElementById('prompt');
        prompt.textContent = "What is the final outcome?";
        this.updateButtonStates(
            ['btn-1', 'btn-2', 'btn-3'],
            ['PLAYER WIN', 'BANKER WIN', 'TIE', '']
        );
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
            setTimeout(() => this.dealNewHand(true), 2000);
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
        document.getElementById('peeks-count').textContent = this.stats.peeks;
    }
}

// Initialize the game
const game = new BaccaratTrainer();

// Add keyboard shortcut to switch card sets (press 's')
document.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 's') {
        game.switchCardSet();
    }
});
