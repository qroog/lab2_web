class TodoApp {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('todoTasks') || '[]'); 
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

        this.els = {
            input: document.getElementById('taskInput'),
            date: document.getElementById('taskDate'),
            list: document.getElementById('taskList')
        };

        this.els.input.addEventListener('keypress', e => {
            if (e.key === 'Enter') this.addTask();
        });
        
        document.getElementById('addTaskBtn').addEventListener('click', () => this.addTask());
        this.render();
    }

    addTask() {
        const title = this.els.input.value.trim();
        if (!title) return alert('Пожалуйста, введите задачу');

        const today = new Date().toISOString().split('T')[0];
        const date = this.els.date.value || today;

        this.tasks.push({ 
            id: Date.now(), 
            title, 
            date, 
            completed: false 
        });
        
        this.els.input.value = this.els.date.value = '';
        this.els.input.focus();
        this.save(); 
        this.render();
    }

	toggleComplete(id) {
		this.tasks.find(t => t.id === id).completed ^= true;
		this.save();
		this.render();
	}
	
	deleteTask(id) {
		this.tasks = this.tasks.filter(t => t.id !== id);
		this.save();
		this.render();
	}
	
	render() {
		this.els.list.innerHTML = this.tasks.map(t => `
			<li class="task-item ${t.completed ? 'completed' : ''}" data-id="${t.id}">
				<input type="checkbox" class="task-checkbox" ${t.completed ? 'checked' : ''} 
					onchange="app.toggleComplete(${t.id})">
				<div class="task-content">
					<div class="task-title">${t.title}</div>
					<div class="task-date">${new Date(t.date).toLocaleDateString('ru-RU', {day: '2-digit', month: '2-digit', year: 'numeric'})}</div>
				</div>
				<div class="task-actions">
					<button class="btn-action btn-delete" onclick="app.deleteTask(${t.id})">🗑️</button>
				</div>
			</li>
		`).join('');
	}

    save() {
        localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
    }
}

const app = new TodoApp();