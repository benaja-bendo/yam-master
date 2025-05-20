import React, { useState } from "react";
import type { Cell, GameContext } from "@yamaster/logic";
import { evaluateCombinations } from "@yamaster/logic";
import { Board } from "./game/Board/Board";
import { Combinations } from "./game/Combinations/Combinations";
import styled from "styled-components";

interface Props {
  context: GameContext | null;
  send: (event: object) => void;
}

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
`;

const GameArea = styled.div`
  display: grid;
  grid-template-columns: 2fr 3fr;
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const DiceArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 16px;
`;

const DiceContainer = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
`;

const Die = styled.button<{ selected?: boolean; kept?: boolean }>`
  width: 50px;
  height: 50px;
  border-radius: 8px;
  background: ${(props) => {
    if (props.kept) return "rgba(76, 175, 80, 0.7)";
    if (props.selected) return "rgba(255, 204, 0, 0.3)";
    return "white";
  }};
  color: ${(props) => (props.kept || props.selected ? "white" : "black")};
  font-size: 1.5rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 2px solid ${(props) => (props.selected ? "#ffcc00" : "transparent")};
  transition: all 0.2s;

  &:hover {
    transform: scale(1.1);
  }
`;

const ActionButton = styled.button<{ primary?: boolean }>`
  padding: 10px 20px;
  border-radius: 8px;
  background: ${(props) =>
    props.primary ? "#4CAF50" : "rgba(255, 255, 255, 0.1)"};
  color: white;
  border: none;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    background: ${(props) =>
      props.primary ? "#45a049" : "rgba(255, 255, 255, 0.2)"};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const GameStatus = styled.div`
  text-align: center;
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  color: white;
  font-weight: bold;
  margin-bottom: 1rem;
`;

export const GameBoard: React.FC<Props> = ({ context, send }) => {
  const [selectedDice, setSelectedDice] = useState<number[]>([]);
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);

  if (!context) return <div>Chargement…</div>;

  const { dice, keptDice, rollsLeft, currentPlayerIndex, players, mode } =
    context;
  const isCurrentPlayerTurn =
    currentPlayerIndex === (context.playerId === "player1" ? 0 : 1);

  // Préparer la grille de jeu
  const grid = Array(5)
    .fill(null)
    .map(() =>
      Array(5)
        .fill(null)
        .map(() => ({ player: undefined, combination: undefined }))
    );

  // Remplir la grille avec les données des joueurs
  if (players) {
    Object.entries(players).forEach(([playerId, playerData]: [string, any]) => {
      playerData.cells?.forEach((cell: Cell & { combination: string }) => {
        if (grid[cell.y] && grid[cell.y][cell.x]) {
          grid[cell.y][cell.x] = {
            player: playerId,
            combination: cell.combination,
          };
        }
      });
    });
  }

  // Gérer le clic sur un dé
  const handleDieClick = (index: number) => {
    if (!isCurrentPlayerTurn) return;
    setSelectedDice((prev) => {
      const isSelected = prev.includes(index);
      return isSelected ? prev.filter((i) => i !== index) : [...prev, index];
    });
  };

  // Gérer le clic sur une cellule de la grille
  const handleCellClick = (x: number, y: number) => {
    if (!isCurrentPlayerTurn) return;
    setSelectedCell({ x, y });
  };

  // Gérer le clic sur le bouton de lancer de dés
  const handleRollClick = () => {
    if (!isCurrentPlayerTurn) return;
    send({ type: "ROLL" });
    setSelectedDice([]);
  };

  // Gérer le clic sur le bouton pour garder les dés sélectionnés
  const handleKeepClick = () => {
    if (!isCurrentPlayerTurn || selectedDice.length === 0) return;
    send({ type: "KEEP", diceIndexes: selectedDice });
    setSelectedDice([]);
  };

  // Gérer le clic sur une combinaison
  const handleCombinationClick = (combination: string) => {
    if (!isCurrentPlayerTurn || !selectedCell) return;
    send({
      type: "CHOOSE_COMBINATION",
      combination,
      cell: selectedCell,
    });
    send({ type: "ACCEPT_COMBINATION", cell: selectedCell });
    setSelectedCell(null);
  };

  const availableCombinations = dice ? evaluateCombinations(dice) : [];
  // Suggérer les meilleures combinaisons (les 3 premières)
  const suggestedCombinations = availableCombinations.slice(0, 3);

  return (
    <GameContainer>
      <GameStatus>
        {isCurrentPlayerTurn
          ? "C'est votre tour"
          : `C'est le tour de ${
              currentPlayerIndex === 0
                ? "Joueur 1"
                : mode === "pvb"
                ? "Bot"
                : "Joueur 2"
            }`}
      </GameStatus>

      <GameArea>
        <div>
          <DiceArea>
            <h3>Dés ({rollsLeft} lancers restants)</h3>
            <DiceContainer>
              {dice.map((die, index) => (
                <Die
                  key={index}
                  selected={selectedDice.includes(index)}
                  kept={keptDice.includes(index)}
                  onClick={() => handleDieClick(index)}
                >
                  {die}
                </Die>
              ))}
            </DiceContainer>
            <div
              style={{ display: "flex", gap: "10px", justifyContent: "center" }}
            >
              <ActionButton
                onClick={handleRollClick}
                disabled={rollsLeft === 0 || !isCurrentPlayerTurn}
                primary
              >
                Lancer les dés
              </ActionButton>
              <ActionButton
                onClick={handleKeepClick}
                disabled={selectedDice.length === 0 || !isCurrentPlayerTurn}
              >
                Garder les dés
              </ActionButton>
            </div>
          </DiceArea>

          <Combinations
            availableCombinations={availableCombinations}
            onChoose={handleCombinationClick}
            suggestedCombinations={suggestedCombinations}
          />
        </div>

        <Board
          grid={grid}
          onCellClick={handleCellClick}
          currentPlayer={currentPlayerIndex === 0 ? "player1" : "player2"}
          selectedCell={selectedCell}
        />
      </GameArea>
    </GameContainer>
  );
};
