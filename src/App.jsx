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

const initialItems = [
    { id: '1', url: 'assets/paris_eiffel_tower_1772208235326.png', tier: 'bank' },
    { id: '2', url: 'assets/japan_mount_fuji_1772208248666.png', tier: 'bank' },
    { id: '3', url: 'assets/venice_canals_1772208263842.png', tier: 'bank' },
    { id: '4', url: 'assets/maldives_beach_1772208278284.png', tier: 'bank' },
    { id: '5', url: 'assets/greece_santorini_1772208292347.png', tier: 'bank' },
];

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

    const getItemsByTier = (tier) => items.filter((item) => item.tier === tier);

    function handleDragEnd(event) {
        const { active, over } = event;

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveATier = TIERS.includes(activeId) || activeId === 'bank';
        const isOverATier = TIERS.includes(overId) || overId === 'bank';

        if (!isActiveATier && isOverATier) {
            // Dropping an item onto an empty tier
            setItems((items) => {
                const activeIndex = items.findIndex((item) => item.id === activeId);
                return [
                    ...items.slice(0, activeIndex),
                    { ...items[activeIndex], tier: overId },
                    ...items.slice(activeIndex + 1),
                ];
            });
            return;
        }

        if (!isActiveATier && !isOverATier) {
            // Dropping an item onto another item
            setItems((items) => {
                const activeIndex = items.findIndex((item) => item.id === activeId);
                const overIndex = items.findIndex((item) => item.id === overId);

                const overItem = items[overIndex];

                let newArray = [...items];
                if (items[activeIndex].tier !== overItem.tier) {
                    // Moved to a different list
                    newArray[activeIndex] = { ...newArray[activeIndex], tier: overItem.tier };
                }
                // Move it within the combined array
                return arrayMove(newArray, activeIndex, overIndex);
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
                        url: e.target.result,
                        tier: 'bank'
                    });
                    if (newItems.length === files.length) {
                        setItems((prev) => [...prev, ...newItems]);
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
                            const tierItems = getItemsByTier(tier);
                            return (
                                <SortableContext key={tier} id={tier} items={tierItems} strategy={rectSortingStrategy}>
                                    <div className="tier-row" data-tier={tier}>
                                        <div className={`tier-label label-${tier.toLowerCase()}`} contentEditable="true" suppressContentEditableWarning={true}>
                                            {tier}
                                        </div>
                                        <div className="tier-content">
                                            {tierItems.map((item) => (
                                                <SortableItem key={item.id} id={item.id} url={item.url} />
                                            ))}
                                        </div>
                                    </div>
                                </SortableContext>
                            );
                        })}
                    </div>

                    <div className="bank-container">
                        <h2>Unranked Collection</h2>
                        <SortableContext id="bank" items={getItemsByTier('bank')} strategy={rectSortingStrategy}>
                            <div className="image-bank">
                                {getItemsByTier('bank').map((item) => (
                                    <SortableItem key={item.id} id={item.id} url={item.url} />
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
