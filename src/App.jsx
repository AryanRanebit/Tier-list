import React, { useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
} from '@dnd-kit/sortable';

import { SortableItem } from './components/SortableItem';

const initialItems = {
    S: [],
    A: [],
    B: [],
    C: [],
    D: [],
    bank: [
        { id: '1', name: 'Portrait 1', imageUrl: 'assets/paris_eiffel_tower_1772208235326.png' },
        { id: '2', name: 'Portrait 2', imageUrl: 'assets/japan_mount_fuji_1772208248666.png' },
        { id: '3', name: 'Portrait 3', imageUrl: 'assets/venice_canals_1772208263842.png' },
        { id: '4', name: 'Portrait 4', imageUrl: 'assets/maldives_beach_1772208278284.png' },
        { id: '5', name: 'Portrait 5', imageUrl: 'assets/greece_santorini_1772208292347.png' },
    ]
};

const TIERS = ['S', 'A', 'B', 'C', 'D'];

function App() {
    const [items, setItems] = useState(initialItems);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function findContainer(id) {
        if (id in items) {
            return id;
        }
        return Object.keys(items).find((key) => items[key].some((item) => item.id === id));
    }

    function handleDragEnd(event) {
        const { active, over } = event;

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const activeContainer = findContainer(activeId);
        const overContainer = findContainer(overId);

        if (!activeContainer || !overContainer) return;

        if (activeContainer === overContainer) {
            const activeIndex = items[activeContainer].findIndex((item) => item.id === activeId);
            const overIndex = items[overContainer].findIndex((item) => item.id === overId);

            setItems((prev) => ({
                ...prev,
                [activeContainer]: arrayMove(prev[activeContainer], activeIndex, overIndex),
            }));
        } else {
            setItems((prev) => {
                const activeItems = [...prev[activeContainer]];
                const overItems = [...prev[overContainer]];

                const activeIndex = activeItems.findIndex((item) => item.id === activeId);
                const overIndex = overItems.findIndex((item) => item.id === overId);

                const [movedItem] = activeItems.splice(activeIndex, 1);

                if (overIndex >= 0) {
                    overItems.splice(overIndex, 0, movedItem);
                } else {
                    overItems.push(movedItem);
                }

                return {
                    ...prev,
                    [activeContainer]: activeItems,
                    [overContainer]: overItems,
                };
            });
        }
    }

    const handleUpload = (event) => {
        const files = event.target.files;
        if (files.length > 0) {
            const newItems = [];
            Array.from(files).forEach((file, i) => {
                if (!file.type.startsWith('image/')) return;
                const reader = new FileReader();
                reader.onload = (e) => {
                    newItems.push({
                        id: `uploaded-${Date.now()}-${i}`,
                        name: file.name,
                        imageUrl: e.target.result,
                    });
                    if (newItems.length === files.length) {
                        setItems((prev) => ({
                            ...prev,
                            bank: [...prev.bank, ...newItems],
                        }));
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    };

    return (
        <div className="app-container">
            <header>
                <h1>Elite Ranker</h1>
                <p>Drag and drop to rank the portraits</p>
                <div className="upload-section">
                    <label htmlFor="imageUpload" className="upload-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="upload-icon"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                        Import Images
                        <input type="file" id="imageUpload" accept="image/*" multiple hidden onChange={handleUpload} />
                    </label>
                </div>
            </header>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <main>
                    <div className="tier-container">
                        {TIERS.map((tier) => {
                            const tierItems = items[tier];
                            return (
                                <SortableContext key={tier} id={tier} items={tierItems} strategy={rectSortingStrategy}>
                                    <div className="tier-row" data-tier={tier}>
                                        <div className={`tier-label label-${tier.toLowerCase()}`} contentEditable="true" suppressContentEditableWarning={true}>
                                            {tier}
                                        </div>
                                        <div className="tier-content">
                                            {tierItems.map((item) => (
                                                <SortableItem key={item.id} id={item.id} url={item.imageUrl} />
                                            ))}
                                        </div>
                                    </div>
                                </SortableContext>
                            );
                        })}
                    </div>

                    <div className="bank-container">
                        <h2>Unranked Collection</h2>
                        <SortableContext id="bank" items={items.bank} strategy={rectSortingStrategy}>
                            <div className="image-bank">
                                {items.bank.map((item) => (
                                    <SortableItem key={item.id} id={item.id} url={item.imageUrl} />
                                ))}
                            </div>
                        </SortableContext>
                    </div>
                </main>
            </DndContext>
        </div>
    );
}

export default App;
