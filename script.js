class TodoApp {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('todoTasks') || '[]');
        this.currentFilter = 'all';
		this.currentSort = 'date-asc'
		this.draggedItem = null;
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
				<div class="filter-group">
					<div class="search-box">
						<input type="text" id="searchInput" placeholder="Поиск задач...">
					</div>
					<div class="filter-buttons">
						<button class="btn btn-filter active" data-filter="all">Все</button>
						<button class="btn btn-filter" data-filter="active">Активные</button>
						<button class="btn btn-filter" data-filter="completed">Выполненные</button>
						<button class="btn btn-filter" id="sortDateBtn">📅 По дате ↑</button>
					</div>
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
			list: document.getElementById('taskList'),
			search: document.getElementById('searchInput'),
			sortBtn: document.getElementById('sortDateBtn') 
		};
		
		this.els.search.addEventListener('input', e => this.render(this.tasks.filter(t => 
			t.title.toLowerCase().includes(e.target.value.toLowerCase())
		)));		

        this.els.input.addEventListener('keypress', e => {
            if (e.key === 'Enter') this.addTask();
        });
        
        document.getElementById('addTaskBtn').addEventListener('click', () => this.addTask());

        document.querySelectorAll('.btn-filter[data-filter]').forEach(btn => 
            btn.addEventListener('click', e => this.setFilter(e.target.dataset.filter))
        );
		
		this.els.sortBtn.addEventListener('click', () => this.toggleDateSort());
		
		this.els.list.addEventListener('dragstart', e => {
			if (e.target.classList.contains('task-item')) {
				this.draggedItem = e.target;
				e.target.classList.add('dragging');
			}
		});

		this.els.list.addEventListener('dragover', e => {
			e.preventDefault();
			const taskItem = e.target.closest('.task-item');
			if (taskItem && taskItem !== this.draggedItem) {
				const rect = taskItem.getBoundingClientRect();
				this.els.list.insertBefore(this.draggedItem, 
					(e.clientY - rect.top) / (rect.bottom - rect.top) > 0.5 ? taskItem.nextSibling : taskItem
				);
			}
		});

		this.els.list.addEventListener('drop', e => {
			e.preventDefault();
			this.els.list.querySelectorAll('.task-item').forEach((el, i) => {
				const task = this.tasks.find(t => t.id === +el.dataset.id);
				if (task) task.order = i;
			});
			this.save();
			this.currentSort = 'custom';
			this.els.sortBtn.innerHTML = '📅 По дате';
		});

		this.els.list.addEventListener('dragend', () => {
			if (this.draggedItem) {
				this.draggedItem.classList.remove('dragging');
				this.draggedItem = null;
			}
		});		
        
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
			completed: false, 
			order: this.tasks.length 
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
    
    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        const newTitle = prompt('Редактировать задачу:', task.title);
        const newDate = prompt('Редактировать дату (YYYY-MM-DD):', task.date);

        if (newTitle !== null) task.title = newTitle.trim();
        if (newDate !== null) task.date = newDate;
        
        this.save();
        this.render();
    }

    setFilter(filter) {
        this.currentFilter = filter;
        document.querySelectorAll('.btn-filter').forEach(btn => 
            btn.classList.toggle('active', btn.dataset.filter === filter)
        );
        this.render();
    }
	
	toggleDateSort() {
		this.currentSort = this.currentSort === 'date-asc' ? 'date-desc' : 'date-asc';
		this.els.sortBtn.innerHTML = `📅 По дате ${this.currentSort === 'date-asc' ? '↑' : '↓'}`;
		this.els.sortBtn.title = this.currentSort === 'date-asc' ? 'Сначала старые' : 'Сначала новые';
		this.render();
	}

	render(tasksToRender = this.tasks) {
		let filtered = this.currentFilter === 'active' ? tasksToRender.filter(t => !t.completed) :
					   this.currentFilter === 'completed' ? tasksToRender.filter(t => t.completed) :
					   tasksToRender;

		const sorted = [...filtered].sort((a, b) => 
			this.currentSort === 'date-asc' ? new Date(a.date) - new Date(b.date) :
			this.currentSort === 'date-desc' ? new Date(b.date) - new Date(a.date) :
			(a.order || 0) - (b.order || 0)
		);

		this.els.list.innerHTML = sorted.map(t => `
			<li class="task-item ${t.completed ? 'completed' : ''}" 
				draggable="true" data-id="${t.id}">
				<input type="checkbox" class="task-checkbox" ${t.completed ? 'checked' : ''} 
					onchange="app.toggleComplete(${t.id})">
				<div class="task-content">
					<div class="task-title">${t.title}</div>
					<div class="task-date">${new Date(t.date).toLocaleDateString('ru-RU', {day: '2-digit', month: '2-digit', year: 'numeric'})}</div>
				</div>
				<div class="task-actions">
					<button class="btn-action btn-edit" onclick="app.editTask(${t.id})">✏️</button>
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