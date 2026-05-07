import React, { useState } from 'react';
import { ClipboardList } from 'lucide-react';
import TaskCreationModal from './TaskCreationModal';

const AssignTaskButton = () => {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <button 
                onClick={() => setShowModal(true)} 
                className="action-btn"
            >
                <ClipboardList />
                <span>Assign Task</span>
            </button>

            <TaskCreationModal 
                isOpen={showModal} 
                onClose={() => setShowModal(false)}
                onTaskCreated={(task) => {
                    console.log('Task created successfully:', task);
                    // Optionally trigger a global notification or refresh
                }}
            />
        </>
    );
};

export default AssignTaskButton;
