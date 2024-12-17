import { Cell } from './Cell';
import { Cell as CellType } from '@/types/game';
import { useGameStore } from '@/store/gameStore';

interface BoardProps {
  board: CellType[];
  onCellClick: (index: number) => void;
  disabled?: boolean;
}

export const Board = ({ board, onCellClick, disabled }: BoardProps) => {
  const isProcessing = useGameStore(state => state.isProcessing);
  const currentPlayer = useGameStore(state => state.currentPlayer);
  const gameMode = useGameStore(state => state.gameMode);
  
  // Disable board during AI's turn or when processing
  const isDisabled = disabled || isProcessing || (gameMode === 'ai' && currentPlayer === 'O');
  
  return (
    <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
      {board.map((value, index) => (
        <Cell
          key={index}
          value={value}
          index={index}
          onClick={onCellClick}
          disabled={isDisabled}
        />
      ))}
    </div>
  );
};