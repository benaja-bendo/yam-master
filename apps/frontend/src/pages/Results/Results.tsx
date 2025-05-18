import React from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../../components/Button/Button';
import { BoardGrid } from '../../components/BoardGrid/BoardGrid';

interface ResultsProps {
  finalScore?: number;
  combinations?: Record<string, number>;
}

export const Results: React.FC<ResultsProps> = ({ 
  finalScore = 0,
  combinations = {}
}) => {
  const navigate = useNavigate();

  const getCombinationCells = () => {
    return Object.entries(combinations).map(([name, score]) => ([
      {
        id: name,
        content: (
          <div className="flex justify-between items-center">
            <span>{name}</span>
            <span className="font-medium">{score}</span>
          </div>
        ),
        isHeader: false
      }
    ]));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Partie terminée !
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Score final : {finalScore} points
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Récapitulatif</h2>
          <BoardGrid
            cells={[
              [{ id: 'header', content: 'Combinaisons', isHeader: true }],
              ...getCombinationCells()
            ]}
            className="mb-6"
          />
        </div>

        <div className="flex flex-col space-y-4">
          <Button
            onClick={() => navigate('/game')}
            size="lg"
          >
            Nouvelle partie
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            size="lg"
          >
            Retour à l'accueil
          </Button>
        </div>
      </div>
    </div>
  );
};