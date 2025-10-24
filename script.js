class TodoApp {
    constructor() {
        this.tasks = [];
        this.init();
    }

    init() {
        const container = document.createElement('div');
        container.className = 'container';
        container.innerHTML = `
            <div class="header"><h1>To<span>-Do</span> List</h1></div>
            <div class="controls">
                <div class="input-group">
                    <input type="text" id="taskInput" placeholder="Введите новую задачу..." class="task-input">
                    <input type="date" id="taskDate" class="task-date">
                    <button class="btn btn-primary" id="addTaskBtn">Добавить задачу</button>
                </div>
            </div>
            <div class="tasks-container">
                <ul class="task-list" id="taskList"></ul>
            </div>
        `;
        document.body.appendChild(container);
    }
}

const app = new TodoApp();