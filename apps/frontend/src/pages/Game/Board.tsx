import React from "react";
import type { GameContext, Cell } from "@yamaster/logic";
import type { GameResponse } from "@/api/gameApi.ts";

interface BoardProps {
  state: GameResponse["state"];
  context: GameContext;
  onRoll: () => void;
  onChoose: (combo: string, cell: Cell) => void;
  mode: "pvp" | "pvb";
}

// Grille de référence (5×5) extraite de vos règles
const gridLabels: string[][] = [
  ["1", "3", "Défi", "4", "6"],
  ["2", "Carré", "Sec", "Full", "5"],
  ["≤8", "Full", "Yam", "Défi", "Suite"],
  ["6", "Sec", "Suite", "≤8", "1"],
  ["3", "2", "Carré", "5", "4"],
];

const Board: React.FC<BoardProps> = ({
  state,
  context,
  onRoll,
  onChoose,
  mode,
}) => {
  return (
    <div className="p-6 grid grid-cols-[1fr_2fr] gap-8 bg-gray-50 rounded-lg shadow-lg">
      {/* Participants */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">
          Participants ({mode.toUpperCase()})
        </h2>
        {context.players.map((p, idx) => (
          <div
            key={p.id}
            className={`p-4 rounded-lg shadow-sm border 
              ${
                context.currentPlayerIndex === idx
                  ? "bg-blue-100 border-blue-300"
                  : "bg-white border-gray-200"
              }`}
          >
            <h3 className="text-lg font-semibold">{p.id.toUpperCase()}</h3>
            <p>Pions restants : {p.pawns}</p>
            <p>Score : {p.score}</p>

            {/* Dés et bouton Roll, uniquement pour le joueur actif */}
            {context.currentPlayerIndex === idx && (
              <>
                <div className="flex mt-2 gap-2">
                  {context.dice.map((d, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 flex items-center justify-center border rounded-md bg-white"
                    >
                      {d}
                    </div>
                  ))}
                </div>
                <button
                  onClick={onRoll}
                  disabled={state.value !== "playing.playerTurn.rollPhase"}
                  className="mt-3 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
                >
                  {state.value === "playing.playerTurn.rollPhase"
                    ? "Lancer les dés"
                    : "Lancé"}
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Plateau de jeu */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Plateau de Yamaster</h2>
        <div className="grid grid-cols-5 gap-2">
          {gridLabels.map((row, x) =>
            row.map((label, y) => {
              const cell: Cell = { x, y };
              return (
                <button
                  key={`${x}-${y}`}
                  onClick={() => onChoose(label, cell)}
                  disabled={state.value !== "playing.playerTurn.choosePhase"}
                  className="p-2 text-center border rounded-md hover:bg-yellow-100 disabled:opacity-50"
                >
                  {label}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Board;
