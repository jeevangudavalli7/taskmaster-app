class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderTasks();
        this.setActiveSection('personal');
    }

    bindEvents() {
        // Task form events
        document.getElementById('addTaskBtn').addEventListener('click', () => this.addTask());
        document.getElementById('taskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        // Navigation events
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.getAttribute('href').substring(1);
                this.setActiveSection(section);
            });
        });

        // Filter events
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });
    }

    setActiveSection(section) {
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[href="#${section}"]`).classList.add('active');

        // Update sections
        document.querySelectorAll('.task-section').forEach(sec => {
            sec.classList.remove('active-section');
        });
        document.getElementById(section).classList.add('active-section');
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.renderTasks();
    }

    addTask() {
        const taskInput = document.getElementById('taskInput');
        const title = taskInput.value.trim();

        if (title) {
            const task = {
                id: Date.now(),
                title,
                completed: false,
                createdAt: new Date().toISOString(),
                priority: 'medium'
            };

            this.tasks.unshift(task); // Add to beginning
            this.saveTasks();
            this.renderTasks();
            taskInput.value = '';
            
            // Show success feedback
            this.showNotification('Task added successfully!', 'success');
        }
    }

    toggleTask(id) {
        this.tasks = this.tasks.map(task => 
            task.id === id ? {...task, completed: !task.completed} : task
        );
        this.saveTasks();
        this.renderTasks();
        
        const task = this.tasks.find(t => t.id === id);
        const message = task.completed ? 'Task completed! 🎉' : 'Task marked as pending';
        this.showNotification(message, 'info');
    }

    deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(task => task.id !== id);
            this.saveTasks();
            this.renderTasks();
            this.showNotification('Task deleted successfully!', 'warning');
        }
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'pending':
                return this.tasks.filter(task => !task.completed);
            case 'completed':
                return this.tasks.filter(task => task.completed);
            default:
                return this.tasks;
        }
    }

    renderTasks() {
        const taskList = document.getElementById('taskList');
        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            taskList.innerHTML = `
                <div class="empty-state">
                    <h3>No tasks found</h3>
                    <p>${this.currentFilter === 'all' ? 'Add your first task to get started!' : 
                         this.currentFilter === 'pending' ? 'All tasks are completed! Great job! 🎉' : 
                         'No completed tasks yet.'}</p>
                </div>
            `;
            return;
        }

        taskList.innerHTML = filteredTasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''}">
                <div class="task-content">
                    <input 
                        type="checkbox" 
                        class="task-checkbox" 
                        ${task.completed ? 'checked' : ''}
                        onchange="taskManager.toggleTask(${task.id})"
                    >
                    <span class="task-text ${task.completed ? 'completed' : ''}">
                        ${this.escapeHtml(task.title)}
                    </span>
                </div>
                <div class="task-actions">
                    <button class="btn-danger" onclick="taskManager.deleteTask(${task.id})">
                        Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    showNotification(message, type) {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create new notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = message;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
            ${type === 'success' ? 'background: #27ae60;' : 
              type === 'warning' ? 'background: #e74c3c;' : 
              'background: #3498db;'}
        `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Add CSS for notifications
const notificationStyles = `
@keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
}
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Initialize the app
const taskManager = new TaskManager();