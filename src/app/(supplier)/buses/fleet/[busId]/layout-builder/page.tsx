'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import { Save, ArrowLeft, Trash2, Check, GripHorizontal, RectangleHorizontal, LayoutGrid } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

type DeckType = 'LOWER' | 'UPPER';
type SeatType = 'SEATER' | 'SLEEPER' | 'SEMI_SLEEPER' | 'EMPTY';

interface SeatCell {
    row: number;
    column: number;
    seatType: SeatType;
    seatName: string;
    isLadiesSeat: boolean;
}

export default function SeatLayoutBuilderPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const busId = params.busId as string;

    const [activeDeck, setActiveDeck] = useState<DeckType>('LOWER');
    const [rows, setRows] = useState(5);
    const [cols, setCols] = useState(12);
    const [lowerLayout, setLowerLayout] = useState<SeatCell[]>([]);
    const [upperLayout, setUpperLayout] = useState<SeatCell[]>([]);
    const [selectedTool, setSelectedTool] = useState<SeatType>('SEATER');

    // Fetch Bus Details
    const { data: bus } = useQuery({
        queryKey: ['bus-details', busId],
        queryFn: async () => {
            // Need a vendor list or all buses to find this specific bus, or assume backend has a getBusById
            // For now, we'll just fetch all and find it since we lack a specific endpoint
            const res = await api.get('/buses/vendors'); // Just a fallback, ideally a specific endpoint
            return null; // Mocking for now, we just need the busId to save
        },
    });

    // Fetch existing layout
    const { data: existingLayout, isLoading } = useQuery({
        queryKey: ['seat-layout', busId],
        queryFn: async () => {
            const res = await api.get(`/buses/${busId}/layouts`);
            return res.data;
        },
    });

    useEffect(() => {
        if (existingLayout && existingLayout.length > 0) {
            const lower = existingLayout.filter((s: any) => s.deck === 'LOWER');
            const upper = existingLayout.filter((s: any) => s.deck === 'UPPER');
            
            // Find max rows and cols to set grid size
            let maxRow = 5;
            let maxCol = 12;
            existingLayout.forEach((s: any) => {
                if (s.row > maxRow) maxRow = s.row;
                if (s.column > maxCol) maxCol = s.column;
            });
            setRows(maxRow);
            setCols(maxCol);

            // Populate grids
            const initialLower: SeatCell[] = [];
            const initialUpper: SeatCell[] = [];

            for (let r = 1; r <= maxRow; r++) {
                for (let c = 1; c <= maxCol; c++) {
                    const lSeat = lower.find((s: any) => s.row === r && s.column === c);
                    initialLower.push({
                        row: r, column: c, 
                        seatType: lSeat ? lSeat.seatType : 'EMPTY', 
                        seatName: lSeat ? lSeat.seatName : '',
                        isLadiesSeat: lSeat ? lSeat.isLadiesSeat : false
                    });

                    const uSeat = upper.find((s: any) => s.row === r && s.column === c);
                    initialUpper.push({
                        row: r, column: c, 
                        seatType: uSeat ? uSeat.seatType : 'EMPTY', 
                        seatName: uSeat ? uSeat.seatName : '',
                        isLadiesSeat: uSeat ? uSeat.isLadiesSeat : false
                    });
                }
            }
            setLowerLayout(initialLower);
            setUpperLayout(initialUpper);
        } else {
            generateEmptyGrid(rows, cols);
        }
    }, [existingLayout]);

    const generateEmptyGrid = (r: number, c: number) => {
        const initialLower: SeatCell[] = [];
        const initialUpper: SeatCell[] = [];
        for (let i = 1; i <= r; i++) {
            for (let j = 1; j <= c; j++) {
                initialLower.push({ row: i, column: j, seatType: 'EMPTY', seatName: '', isLadiesSeat: false });
                initialUpper.push({ row: i, column: j, seatType: 'EMPTY', seatName: '', isLadiesSeat: false });
            }
        }
        setLowerLayout(initialLower);
        setUpperLayout(initialUpper);
    };

    const handleGridSizeChange = () => {
        generateEmptyGrid(rows, cols);
    };

    const handleCellClick = (row: number, col: number) => {
        const layout = activeDeck === 'LOWER' ? lowerLayout : upperLayout;
        const setLayout = activeDeck === 'LOWER' ? setLowerLayout : setUpperLayout;

        setLayout(layout.map(cell => {
            if (cell.row === row && cell.column === col) {
                return { 
                    ...cell, 
                    seatType: selectedTool,
                    // Auto name based on row/col if not empty
                    seatName: selectedTool !== 'EMPTY' ? `${activeDeck === 'LOWER' ? 'L' : 'U'}-${row}${String.fromCharCode(64 + col)}` : ''
                };
            }
            return cell;
        }));
    };

    const saveMutation = useMutation({
        mutationFn: async () => {
            const payload = [...lowerLayout, ...upperLayout]
                .filter(c => c.seatType !== 'EMPTY')
                .map(c => ({
                    deck: c.row > 0 && activeDeck === 'LOWER' ? 'LOWER' : 'UPPER', // Logic simplification
                    row: c.row,
                    column: c.column,
                    seatType: c.seatType,
                    seatName: c.seatName,
                    isLadiesSeat: c.isLadiesSeat
                }));
            
            // Fix deck mapping
            const finalPayload = [
                ...lowerLayout.filter(c => c.seatType !== 'EMPTY').map(c => ({...c, deck: 'LOWER'})),
                ...upperLayout.filter(c => c.seatType !== 'EMPTY').map(c => ({...c, deck: 'UPPER'}))
            ];

            return api.post(`/buses/${busId}/layouts`, finalPayload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['seat-layout'] });
            alert('Seat layout saved successfully!');
            router.push('/buses/fleet');
        }
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[hsl(var(--accent))]"></div>
            </div>
        );
    }

    const currentLayout = activeDeck === 'LOWER' ? lowerLayout : upperLayout;

    return (
        <div>
            <Topbar title="Seat Layout Builder" subtitle="Design your bus deck configuration visually" />
            <div className="p-6 space-y-6 animate-fadeIn">

                <div className="flex items-center justify-between">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-sm font-medium hover:text-[hsl(var(--accent))] transition-colors">
                        <ArrowLeft size={16} /> Back to Fleet
                    </button>
                    <button 
                        onClick={() => saveMutation.mutate()}
                        disabled={saveMutation.isPending}
                        className="btn-primary flex items-center gap-2 px-6 py-2 text-sm disabled:opacity-50"
                    >
                        <Save size={16} /> {saveMutation.isPending ? 'Saving...' : 'Save Layout'}
                    </button>
                </div>

                <div className="flex gap-6">
                    {/* Toolbar Panel */}
                    <div className="w-64 space-y-6">
                        <div className="glass-card p-5">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] mb-4">Deck Selection</h3>
                            <div className="flex bg-white/5 p-1 rounded-lg">
                                <button 
                                    onClick={() => setActiveDeck('LOWER')}
                                    className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors ${activeDeck === 'LOWER' ? 'bg-[hsl(var(--accent))] text-white' : 'text-[hsl(var(--muted-foreground))] hover:bg-white/5'}`}
                                >
                                    Lower Deck
                                </button>
                                <button 
                                    onClick={() => setActiveDeck('UPPER')}
                                    className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors ${activeDeck === 'UPPER' ? 'bg-[hsl(var(--accent))] text-white' : 'text-[hsl(var(--muted-foreground))] hover:bg-white/5'}`}
                                >
                                    Upper Deck
                                </button>
                            </div>
                        </div>

                        <div className="glass-card p-5">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] mb-4">Grid Configuration</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-medium block mb-1">Columns (Length)</label>
                                    <input type="number" value={cols} onChange={e => setCols(Number(e.target.value))} className="form-input text-sm" min={5} max={20} />
                                </div>
                                <div>
                                    <label className="text-xs font-medium block mb-1">Rows (Width)</label>
                                    <input type="number" value={rows} onChange={e => setRows(Number(e.target.value))} className="form-input text-sm" min={3} max={6} />
                                </div>
                                <button onClick={handleGridSizeChange} className="w-full py-2 text-xs border border-[var(--glass-border)] rounded-lg hover:bg-white/5 transition-colors">
                                    Apply Grid Size
                                </button>
                                <p className="text-[10px] text-red-500 opacity-80 mt-1">*Applying clears current layout</p>
                            </div>
                        </div>

                        <div className="glass-card p-5">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] mb-4">Painting Tools</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { type: 'SEATER', icon: GripHorizontal, label: 'Seater', color: 'bg-blue-500/20 text-blue-500 border-blue-500/50' },
                                    { type: 'SEMI_SLEEPER', icon: LayoutGrid, label: 'Semi', color: 'bg-indigo-500/20 text-indigo-500 border-indigo-500/50' },
                                    { type: 'SLEEPER', icon: RectangleHorizontal, label: 'Sleeper', color: 'bg-purple-500/20 text-purple-500 border-purple-500/50' },
                                    { type: 'EMPTY', icon: Trash2, label: 'Eraser', color: 'bg-red-500/20 text-red-500 border-red-500/50' },
                                ].map((tool) => (
                                    <button
                                        key={tool.type}
                                        onClick={() => setSelectedTool(tool.type as SeatType)}
                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${selectedTool === tool.type ? tool.color : 'border-[var(--glass-border)] bg-white/5 text-[hsl(var(--muted-foreground))] hover:border-white/20'}`}
                                    >
                                        <tool.icon size={20} className="mb-1" />
                                        <span className="text-[10px] font-bold">{tool.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Canvas Panel */}
                    <div className="flex-1 glass-card p-8 flex flex-col items-center justify-center min-h-[600px] overflow-auto">
                        <div className="text-center mb-8">
                            <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">Front of Bus (Driver Side)</h2>
                            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Select a tool and click on the grid to paint seats</p>
                        </div>

                        {/* Bus Frame border */}
                        <div className="border-4 border-[var(--glass-border-light)] rounded-[3rem] p-6 pb-20 relative bg-[#0a0a0a]">
                            {/* Steering Wheel Graphic */}
                            <div className="absolute top-2 right-12 w-12 h-12 border-4 border-[var(--glass-border)] rounded-full flex items-center justify-center opacity-30">
                                <div className="w-2 h-8 bg-[var(--glass-border)] rotate-45 absolute" />
                                <div className="w-2 h-8 bg-[var(--glass-border)] -rotate-45 absolute" />
                            </div>

                            <div 
                                className="grid gap-3 mt-12"
                                style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
                            >
                                {currentLayout.map((cell) => {
                                    const isSeater = cell.seatType === 'SEATER' || cell.seatType === 'SEMI_SLEEPER';
                                    const isSleeper = cell.seatType === 'SLEEPER';
                                    const isEmpty = cell.seatType === 'EMPTY';

                                    let bgClass = 'border-[var(--glass-border)] bg-white/5 hover:border-white/20';
                                    if (isSeater) bgClass = 'bg-blue-500/20 text-blue-500 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]';
                                    if (isSleeper) bgClass = 'bg-purple-500/20 text-purple-500 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]';

                                    return (
                                        <div
                                            key={`${cell.row}-${cell.column}`}
                                            onClick={() => handleCellClick(cell.row, cell.column)}
                                            className={`
                                                cursor-pointer border-2 transition-all flex items-center justify-center
                                                ${isSleeper ? 'w-20 h-10 rounded-md' : 'w-12 h-12 rounded-xl'}
                                                ${bgClass}
                                                ${isEmpty ? 'border-dashed opacity-40' : ''}
                                            `}
                                        >
                                            {!isEmpty && (
                                                <span className="text-[10px] font-bold">{cell.seatName}</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Back of bus label */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs font-bold text-[hsl(var(--muted-foreground))] tracking-widest uppercase">
                                Rear Engine
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
