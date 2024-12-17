import { motion } from 'framer-motion';
import { Cell as CellType } from '@/types/game';
import clsx from 'clsx';

interface CellProps {
  value: CellType;
  index: number;
  onClick: (index: number) => void;
  disabled?: boolean;
}

export const Cell = ({ value, index, onClick, disabled }: CellProps) => {
  return (
    <motion.button
      whileHover={{ scale: value ? 1 : 1.05 }}
      whileTap={{ scale: value ? 1 : 0.95 }}
      className={clsx(
        'aspect-square rounded-xl text-4xl font-bold flex items-center justify-center',
        'transition-all duration-200 shadow-md',
        {
          'bg-white hover:bg-gray-50': !value,
          'cursor-not-allowed': value || disabled,
          'hover:bg-gray-50': !value && !disabled,
          'text-blue-500': value === 'X',
          'text-purple-500': value === 'O',
          'border border-gray-200': true
        }
      )}
      onClick={() => !value && !disabled && onClick(index)}
      disabled={!!value || disabled}
    >
      {value && (
        <motion.span
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 20
          }}
        >
          {value}
        </motion.span>
      )}
    </motion.button>
  );
};