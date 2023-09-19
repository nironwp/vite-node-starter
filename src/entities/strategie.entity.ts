export class StrategieEntity {
    constructor(
        private readonly presetColors: number[],
        private readonly bet_color: number,
        private readonly id?: string
    ) {}

    validateBet(results: number[]): {
        bet_color: number | null;
    } {
        let validBet = true;

        for (
            let index = 0;
            index <= results.length && index < this.presetColors.length;
            index++
        ) {
            const element = results[index];
            const presetColor = this.presetColors[index];
            console.log(element);
            console.log(presetColor);
            if (element !== presetColor) {
                validBet = false;
                break;
            }
        }

        if (validBet) {
            return {
                bet_color: this.bet_color,
            };
        } else {
            return {
                bet_color: null,
            };
        }
    }
}

// const strategie = new StrategieEntity([1, 2, 2, 1], 5);
// console.log(strategie.validateBet([1, 2, 2, 1, 2,3,4,5,6,7]));
