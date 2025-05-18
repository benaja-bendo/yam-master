// hooks/useDice.ts
import {useState} from "react";
import type {DiceValue} from "../types/game.types.ts";
import type {GameState} from "@yamaster/logic";

export const useDice = () => {
    const [dice, setDice] = useState<DiceValue[]>([]);
    const [selectedDice, setSelectedDice] = useState<boolean[]>([]);

    const rollDice = () => {
        // Logique pour lancer les dés
    };

    const toggleDiceSelection = (index: number) => {
        // Logique pour sélectionner/désélectionner un dé
    };

    return { dice, selectedDice, rollDice, toggleDiceSelection };
};

// hooks/useGame.ts
export const useGame = () => {
    const [gameState, setGameState] = useState<GameState>({
        // État initial du jeu
    });

    // Logique du jeu
};