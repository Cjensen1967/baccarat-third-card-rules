# Baccarat Third Card Training App

An interactive web application designed to help users learn and practice the third card drawing rules in Baccarat.

## Features

- Simulates simplified hands of Baccarat
- Interactive decision-making process
- Instant feedback on user choices
- Progress tracking with correct/incorrect counters
- Realistic card visuals
- Felt-table inspired design

## How to Use

1. Open `index.html` in a web browser to start the training app
2. For each hand, you'll be guided through the following decisions:
   - Identify if there's a natural win
   - Decide if Player should draw a third card
   - Decide if Banker should draw a third card
   - Determine the final outcome

## Learning Points

### Natural Wins
- A natural 8 or 9 from the first two cards wins
- If both sides have naturals, higher value wins
- Equal naturals result in a tie

### Player's Third Card Rule
- Player draws on totals of 0-5
- Player stands on totals of 6-7

### Banker's Third Card Rule
Depends on Banker's total and Player's third card:
- Banker total 0-2: Always draws
- Banker total 3: Draws unless Player's third card is 8
- Banker total 4: Draws on Player's third card 2-7
- Banker total 5: Draws on Player's third card 4-7
- Banker total 6: Draws on Player's third card 6-7
- Banker total 7: Always stands

## Technical Details

- Built with vanilla HTML, CSS, and JavaScript
- No external dependencies required
- Card assets included in assets folder
