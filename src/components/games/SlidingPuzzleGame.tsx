import React, { useState, useEffect } from 'react';
import { soundManager } from '../../utils/audio';
import { unlockBadge } from '../../utils/storage';
import { RotateCcw, ArrowLeft, Trophy, CheckCircle2 } from 'lucide-react';

export const SlidingPuzzleGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [gridSize, setGridSize] = useState<number>(3); // 3x3 or 4x4
  const [tiles, setTiles] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);

  // Initialize and check solvable inversion count
  const initGame = (size = gridSize) => {
    soundManager.playClick();
    const count = size * size;
    let arr = Array.from({ length: count - 1 }, (_, i) => i + 1);
    arr.push(0); // 0 represents the empty space

    // Shuffle by performing random valid moves from solved state to guarantee solvability
    for (let i = 0; i < 150; i++) {
      const emptyIdx = arr.indexOf(0);
      const row = Math.floor(emptyIdx / size);
      const col = emptyIdx % size;

      const validNeighbors: number[] = [];
      if (row > 0) validNeighbors.push((row - 1) * size + col); // up
      if (row < size - 1) validNeighbors.push((row + 1) * size + col); // down
      if (col > 0) validNeighbors.push(row * size + (col - 1)); // left
      if (col < size - 1) validNeighbors.push(row * size + (col + 1)); // right

      const swapIdx = validNeighbors[Math.floor(Math.random() * validNeighbors.length)];
      [arr[emptyIdx], arr[swapIdx]] = [arr[swapIdx], arr[emptyIdx]];
    }

    setTiles(arr);
    setMoves(0);
    setIsWon(false);
  };

  useEffect(() => {
    initGame(gridSize);
  }, [gridSize]);

  const handleTileClick = (index: number) => {
    if (isWon) return;
    const emptyIdx = tiles.indexOf(0);
    const tileRow = Math.floor(index / gridSize);
    const tileCol = index % gridSize;
    const emptyRow = Math.floor(emptyIdx / gridSize);
    const emptyCol = emptyIdx % gridSize;

    // Check if adjacent
    const isAdjacent =
      (Math.abs(tileRow - emptyRow) === 1 && tileCol === emptyCol) ||
      (Math.abs(tileCol - emptyCol) === 1 && tileRow === emptyRow);

    if (isAdjacent) {
      soundManager.playClick();
      const newTiles = [...tiles];
      [newTiles[index], newTiles[emptyIdx]] = [newTiles[emptyIdx], newTiles[index]];
      setTiles(newTiles);
      setMoves((prev) => prev + 1);

      // Check win condition: 1, 2, ..., N-1, 0
      const isSolved = newTiles.slice(0, -1).every((num, i) => num === i + 1);
      if (isSolved) {
        setIsWon(true);
        soundManager.playVictory();
        unlockBadge('gamer_learner');
      }
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
            <h3 className="text-base font-bold text-slate-900">Xếp Hình Trượt Số Thư Giãn</h3>
            <p className="text-xs text-slate-500">Trượt các số về đúng thứ tự từ bé đến lớn</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Size picker */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setGridSize(3)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                gridSize === 3 ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'
              }`}
            >
              3 x 3
            </button>
            <button
              onClick={() => setGridSize(4)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                gridSize === 4 ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'
              }`}
            >
              4 x 4
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span className="tabular-nums">Bước: {moves}</span>
          </div>

          <button
            onClick={() => initGame(gridSize)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Chơi lại</span>
          </button>
        </div>
      </div>

      {/* Board */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col items-center min-h-[380px]">
        {isWon && (
          <div className="text-center p-6 bg-white rounded-2xl border border-emerald-200 shadow-sm max-w-sm w-full mb-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <h4 className="text-lg font-bold text-emerald-800">Khéo Léo Tuyệt Vời!</h4>
            <p className="text-sm text-slate-600 mt-1">
              Bạn đã hoàn thành bảng xếp hình trong <span className="font-bold text-emerald-600">{moves} bước</span>.
            </p>
            <button
              onClick={() => initGame(gridSize)}
              className="mt-4 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              Chơi lại
            </button>
          </div>
        )}

        <div
          className="grid gap-2 bg-slate-200 p-3 rounded-2xl shadow-inner select-none"
          style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
        >
          {tiles.map((num, idx) => {
            if (num === 0) {
              return (
                <div
                  key={idx}
                  className={`${
                    gridSize === 3 ? 'w-16 h-16 sm:w-20 sm:h-20' : 'w-12 h-12 sm:w-16 sm:h-16'
                  } rounded-xl bg-slate-300/40`}
                />
              );
            }
            return (
              <button
                key={idx}
                onClick={() => handleTileClick(idx)}
                className={`${
                  gridSize === 3 ? 'w-16 h-16 sm:w-20 sm:h-20 text-2xl sm:text-3xl' : 'w-12 h-12 sm:w-16 sm:h-16 text-lg sm:text-2xl'
                } rounded-xl font-bold bg-white text-slate-800 border border-slate-300 shadow-sm hover:bg-blue-50 hover:border-blue-300 transition-all active:scale-95 flex items-center justify-center`}
              >
                {num}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
