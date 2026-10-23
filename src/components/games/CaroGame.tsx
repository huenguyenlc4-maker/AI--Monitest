import React, { useState } from 'react';
import { soundManager } from '../../utils/audio';
import { unlockBadge } from '../../utils/storage';
import { RotateCcw, ArrowLeft, Bot, Users, Award } from 'lucide-react';

const SIZE = 11; // 11x11 board perfect for mobile screens

type CellValue = 'X' | 'O' | null;

export const CaroGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [board, setBoard] = useState<CellValue[]>(Array(SIZE * SIZE).fill(null));
  const [isXNext, setIsXNext] = useState<boolean>(true);
  const [vsAi, setVsAi] = useState<boolean>(true);
  const [winner, setWinner] = useState<'X' | 'O' | 'Draw' | null>(null);
  const [winningCells, setWinningCells] = useState<number[]>([]);

  const resetGame = () => {
    soundManager.playClick();
    setBoard(Array(SIZE * SIZE).fill(null));
    setIsXNext(true);
    setWinner(null);
    setWinningCells([]);
  };

  const checkWin = (currentBoard: CellValue[], index: number, player: 'X' | 'O'): number[] | null => {
    const r = Math.floor(index / SIZE);
    const c = index % SIZE;

    const directions = [
      [0, 1], // horizontal
      [1, 0], // vertical
      [1, 1], // diagonal down-right
      [1, -1], // diagonal down-left
    ];

    for (const [dr, dc] of directions) {
      const line = [index];

      // forward
      for (let step = 1; step < 5; step++) {
        const nr = r + dr * step;
        const nc = c + dc * step;
        if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE) break;
        const nIndex = nr * SIZE + nc;
        if (currentBoard[nIndex] === player) {
          line.push(nIndex);
        } else {
          break;
        }
      }

      // backward
      for (let step = 1; step < 5; step++) {
        const nr = r - dr * step;
        const nc = c - dc * step;
        if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE) break;
        const nIndex = nr * SIZE + nc;
        if (currentBoard[nIndex] === player) {
          line.push(nIndex);
        } else {
          break;
        }
      }

      if (line.length >= 5) {
        return line;
      }
    }
    return null;
  };

  // Heuristic Bot Move
  const getAiMove = (currentBoard: CellValue[]): number => {
    // 1. Can AI win in 1 move?
    for (let i = 0; i < currentBoard.length; i++) {
      if (!currentBoard[i]) {
        currentBoard[i] = 'O';
        const win = checkWin(currentBoard, i, 'O');
        currentBoard[i] = null;
        if (win) return i;
      }
    }

    // 2. Can Player win in 1 move? Block them!
    for (let i = 0; i < currentBoard.length; i++) {
      if (!currentBoard[i]) {
        currentBoard[i] = 'X';
        const block = checkWin(currentBoard, i, 'X');
        currentBoard[i] = null;
        if (block) return i;
      }
    }

    // 3. Find closest move to center or existing pieces
    const center = Math.floor((SIZE * SIZE) / 2);
    if (!currentBoard[center]) return center;

    // Pick empty cell adjacent to any played cell
    const candidates: { index: number; score: number }[] = [];
    for (let i = 0; i < currentBoard.length; i++) {
      if (!currentBoard[i]) {
        const r = Math.floor(i / SIZE);
        const c = i % SIZE;
        let adjCount = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) {
              if (currentBoard[nr * SIZE + nc] !== null) {
                adjCount++;
              }
            }
          }
        }
        if (adjCount > 0) {
          candidates.push({ index: i, score: adjCount });
        }
      }
    }

    if (candidates.length > 0) {
      candidates.sort((a, b) => b.score - a.score);
      return candidates[0].index;
    }

    // Fallback: any empty cell
    const emptyIndices = currentBoard
      .map((val, idx) => (val === null ? idx : null))
      .filter((val): val is number => val !== null);
    return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  };

  const handleCellClick = (index: number) => {
    if (board[index] || winner) return;

    soundManager.playClick();
    const newBoard = [...board];
    const currentPlayer = isXNext ? 'X' : 'O';
    newBoard[index] = currentPlayer;

    const winLine = checkWin(newBoard, index, currentPlayer);
    if (winLine) {
      setBoard(newBoard);
      setWinner(currentPlayer);
      setWinningCells(winLine);
      soundManager.playVictory();
      unlockBadge('gamer_learner');
      return;
    }

    // Check draw
    if (newBoard.every((cell) => cell !== null)) {
      setBoard(newBoard);
      setWinner('Draw');
      soundManager.playAlert();
      return;
    }

    // Handle AI turn
    if (vsAi && isXNext) {
      setBoard(newBoard);
      setIsXNext(false);

      setTimeout(() => {
        const aiIndex = getAiMove(newBoard);
        if (aiIndex !== undefined && aiIndex >= 0) {
          newBoard[aiIndex] = 'O';
          soundManager.playSelect();
          const aiWinLine = checkWin(newBoard, aiIndex, 'O');
          if (aiWinLine) {
            setBoard([...newBoard]);
            setWinner('O');
            setWinningCells(aiWinLine);
            soundManager.playAlert();
          } else {
            setBoard([...newBoard]);
            setIsXNext(true);
          }
        }
      }, 350);
    } else {
      setBoard(newBoard);
      setIsXNext(!isXNext);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundManager.playClick();
              onBack();
            }}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h3 className="text-base font-bold text-slate-900">Cờ Caro Vui Học (5 Ô Thắng)</h3>
            <p className="text-xs text-slate-500">Tạo chuỗi 5 quân liên tiếp theo hàng ngang, dọc hoặc chéo</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => {
                soundManager.playClick();
                setVsAi(true);
                resetGame();
              }}
              className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                vsAi ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Đấu với máy</span>
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setVsAi(false);
                resetGame();
              }}
              className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                !vsAi ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>2 người chơi</span>
            </button>
          </div>

          <button
            onClick={resetGame}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Ván mới</span>
          </button>
        </div>
      </div>

      {/* Status banner */}
      <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Lượt chơi:</span>
          {winner ? (
            <span className="font-bold text-emerald-600 flex items-center gap-1">
              <Award className="w-4 h-4" />
              {winner === 'Draw'
                ? 'Hòa nhau!'
                : winner === 'X'
                ? 'Quân X (Bạn) đã chiến thắng!'
                : vsAi
                ? 'Máy (Quân O) đã chiến thắng!'
                : 'Quân O đã chiến thắng!'}
            </span>
          ) : (
            <span className="font-bold flex items-center gap-1.5">
              <span className={isXNext ? 'text-blue-600 font-extrabold' : 'text-rose-500 font-extrabold'}>
                Quân {isXNext ? 'X' : 'O'}
              </span>
              <span className="text-slate-400 font-normal">
                ({isXNext ? 'Bạn' : vsAi ? 'Máy đang tính...' : 'Người chơi 2'})
              </span>
            </span>
          )}
        </div>
        <div className="text-xs text-slate-400">Bàn cờ {SIZE}x{SIZE}</div>
      </div>

      {/* Board */}
      <div className="bg-slate-50 p-2 sm:p-4 rounded-2xl border border-slate-200 flex justify-center overflow-x-auto">
        <div
          className="grid gap-1 bg-amber-50 p-2 rounded-xl border border-amber-200 shadow-inner"
          style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))` }}
        >
          {board.map((cell, idx) => {
            const isWinCell = winningCells.includes(idx);
            return (
              <button
                key={idx}
                onClick={() => handleCellClick(idx)}
                disabled={!!cell || !!winner || (vsAi && !isXNext)}
                className={`w-7 h-7 sm:w-10 sm:h-10 text-base sm:text-xl font-bold flex items-center justify-center rounded transition-all ${
                  isWinCell
                    ? 'bg-amber-300 ring-2 ring-amber-500 text-slate-900 scale-105'
                    : cell === 'X'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : cell === 'O'
                    ? 'bg-white text-rose-500 shadow-sm'
                    : 'bg-white/80 hover:bg-white text-transparent border border-slate-200'
                }`}
              >
                {cell}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
