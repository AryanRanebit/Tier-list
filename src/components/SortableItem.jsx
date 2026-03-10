import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function SortableItem(props) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: props.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: props.isOverlay ? undefined : transition,
        zIndex: props.isOverlay ? 999 : (isDragging ? 2 : 1),
        // Ghost effect for the original spot, overlay gets full opacity
        opacity: isDragging && !props.isOverlay ? 0.3 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={`draggable-wrapper ${props.isOverlay ? 'is-overlay' : ''}`}>
            <img src={props.url} alt={props.alt || 'Item'} className="draggable-item" />
        </div>
    );
}
