import React, { useState, useEffect } from 'react';
import { soundManager } from '../../utils/audio';
import { unlockBadge } from '../../utils/storage';
import { RotateCcw, ArrowLeft, Trophy, Clock, CheckCircle2 } from 'lucide-react';

interface Tile {
  id: number;
  row: number;
  col: number;
  icon: string;
  matched: boolean;
}

const ICONS = ['🍎', '🚀', '🌟', '🌺', '⚽', '🎨', '🐶', '📚', '🧩', '🎵'];

export const PikachuMatchGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const ROWS = 6;
  const COLS = 6;
  const [grid, setGrid] = useState<Tile[]>([]);
  const [selected, setSelected] = useState<Tile | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [isWon, setIsWon] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const initGame = () => {
    soundManager.playClick();
    const totalTiles = ROWS * COLS;
    const pairsNeeded = totalTiles / 2;
    const selectedIcons: string[] = [];
    for (let i = 0; i < pairsNeeded; i++) {
      const icon = ICONS[i % ICONS.length];
      selectedIcons.push(icon, icon);
    }
    // Shuffle
    const shuffled = selectedIcons.sort(() => Math.random() - 0.5);

    const tiles: Tile[] = [];
    let idx = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        tiles.push({
          id: idx,
          row: r,
          col: c,
          icon: shuffled[idx],
          matched: false,
        });
        idx++;
      }
    }
    setGrid(tiles);
    setSelected(null);
    setScore(0);
    setTimeLeft(120);
    setIsWon(false);
    setIsGameOver(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  useEffect(() => {
    if (isWon || isGameOver || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsGameOver(true);
          soundManager.playAlert();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isWon, isGameOver, timeLeft]);

  // Check simple line of sight or adjacent/turn match
  const canConnect = (t1: Tile, t2: Tile): boolean => {
    if (t1.icon !== t2.icon || t1.id === t2.id) return false;
    // Direct adjacent
    const isAdjacent =
      (Math.abs(t1.row - t2.row) === 1 && t1.col === t2.col) ||
      (Math.abs(t1.col - t2.col) === 1 && t1.row === t2.row);
    if (isAdjacent) return true;

    // Check same row with empty path
    if (t1.row === t2.row) {
      const minC = Math.min(t1.col, t2.col);
      const maxC = Math.max(t1.col, t2.col);
      let clear = true;
      for (let c = minC + 1; c < maxC; c++) {
        const between = grid.find((t) => t.row === t1.row && t.col === c);
        if (between && !between.matched) {
          clear = false;
          break;
        }
      }
      if (clear) return true;
    }

    // Check same col with empty path
    if (t1.col === t2.col) {
      const minR = Math.min(t1.row, t2.row);
      const maxR = Math.max(t1.row, t2.row);
      let clear = true;
      for (let r = minR + 1; r < maxR; r++) {
        const between = grid.find((t) => t.col === t1.col && t.row === r);
        if (between && !between.matched) {
          clear = false;
          break;
        }
      }
      if (clear) return true;
    }

    // L-shaped path (1 turn)
    // Corner 1: (t1.row, t2.col)
    const corner1 = grid.find((t) => t.row === t1.row && t.col === t2.col);
    if (corner1 && corner1.matched) {
      // check t1 to corner1 and corner1 to t2
      const path1 = isRowClear(t1.row, t1.col, t2.col) && isColClear(t2.col, t1.row, t2.row);
      if (path1) return true;
    }

    // Corner 2: (t2.row, t1.col)
    const corner2 = grid.find((t) => t.row === t2.row && t.col === t1.col);
    if (corner2 && corner2.matched) {
      const path2 = isColClear(t1.col, t1.row, t2.row) && isRowClear(t2.row, t1.col, t2.col);
      if (path2) return true;
    }

    // Outer border connection (perimeter connect)
    if (
      (t1.row === 0 && t2.row === 0) ||
      (t1.row === ROWS - 1 && t2.row === ROWS - 1) ||
      (t1.col === 0 && t2.col === 0) ||
      (t1.col === COLS - 1 && t2.col === COLS - 1)
    ) {
      return true;
    }

    return false;
  };

  const isRowClear = (r: number, c1: number, c2: number): boolean => {
    const minC = Math.min(c1, c2);
    const maxC = Math.max(c1, c2);
    for (let c = minC + 1; c < maxC; c++) {
      const tile = grid.find((t) => t.row === r && t.col === c);
      if (tile && !tile.matched) return false;
    }
    return true;
  };

  const isColClear = (c: number, r1: number, r2: number): boolean => {
    const minR = Math.min(r1, r2);
    const maxR = Math.max(r1, r2);
    for (let r = minR + 1; r < maxR; r++) {
      const tile = grid.find((t) => t.col === c && t.row === r);
      if (tile && !tile.matched) return false;
    }
    return true;
  };

  const handleTileClick = (tile: Tile) => {
    if (tile.matched || isGameOver || isWon) return;
    soundManager.playClick();

    if (!selected) {
      setSelected(tile);
    } else {
      if (selected.id === tile.id) {
        setSelected(null);
        return;
      }

      if (canConnect(selected, tile)) {
        // Matched!
        soundManager.playCorrect();
        const newGrid = grid.map((t) => {
          if (t.id === selected.id || t.id === tile.id) {
            return { ...t, matched: true };
          }
          return t;
        });
        setGrid(newGrid);
        setScore((prev) => prev + 20);
        setSelected(null);

        // Check if all matched
        const allCleared = newGrid.every((t) => t.matched);
        if (allCleared) {
          setIsWon(true);
          soundManager.playVictory();
          unlockBadge('gamer_learner');
        }
      } else {
        soundManager.playIncorrect();
        setSelected(tile);
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
            title="Quay lại danh sách trò chơi"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h3 className="text-base font-bold text-slate-900">Pikachu Ghép Hình Vui Học</h3>
            <p className="text-xs text-slate-500">Nối 2 ô có biểu tượng giống nhau bằng tối đa 2 khúc gấp</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm font-semibold">
          <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
            <Trophy className="w-4 h-4" />
            <span className="tabular-nums">Điểm: {score}</span>
          </div>
          <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
            <Clock className="w-4 h-4" />
            <span className="tabular-nums">{timeLeft}s</span>
          </div>
          <button
            onClick={initGame}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Chơi lại</span>
          </button>
        </div>
      </div>

      {/* Board */}
      <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-200 flex flex-col items-center justify-center min-h-[380px]">
        {isWon && (
          <div className="text-center p-6 bg-white rounded-2xl border border-emerald-200 shadow-sm max-w-sm w-full mb-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <h4 className="text-lg font-bold text-emerald-800">Chúc Mừng Bạn Đã Thắng!</h4>
            <p className="text-sm text-slate-600 mt-1">
              Bạn đã hoàn thành với số điểm <span className="font-bold text-emerald-600">{score}</span> và còn dư{' '}
              <span className="font-bold">{timeLeft}s</span>.
            </p>
            <button
              onClick={initGame}
              className="mt-4 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              Chơi ván mới
            </button>
          </div>
        )}

        {isGameOver && !isWon && (
          <div className="text-center p-6 bg-white rounded-2xl border border-rose-200 shadow-sm max-w-sm w-full mb-4">
            <Clock className="w-12 h-12 text-rose-500 mx-auto mb-2" />
            <h4 className="text-lg font-bold text-rose-800">Hết Giờ Rồi!</h4>
            <p className="text-sm text-slate-600 mt-1">Đừng nản lòng, hãy thử lại để đạt điểm số cao hơn nhé.</p>
            <button
              onClick={initGame}
              className="mt-4 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              Thử lại ngay
            </button>
          </div>
        )}

        <div
          className="grid gap-2 select-none"
          style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
        >
          {grid.map((tile) => {
            if (tile.matched) {
              return (
                <div
                  key={tile.id}
                  className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl bg-transparent border border-dashed border-slate-200/50"
                />
              );
            }
            const isSelected = selected?.id === tile.id;
            return (
              <button
                key={tile.id}
                onClick={() => handleTileClick(tile)}
                className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl text-2xl sm:text-3xl flex items-center justify-center transition-all shadow-sm ${
                  isSelected
                    ? 'bg-amber-100 border-2 border-amber-500 scale-105 shadow-md'
                    : 'bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300'
                }`}
              >
                {tile.icon}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
