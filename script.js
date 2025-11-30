class TodoApp {
	constructor() {
		this.tasks = JSON.parse(localStorage.getItem('todoTasks') || '[]');
		this.currentFilter = 'all';
		this.currentSort = 'date-asc';
		this.draggedItem = null;

		this.init();
	}

	init() {
		const container = document.createElement('div');
		container.className = 'container';

		const header = document.createElement('div');
		header.className = 'header';
		const h1 = document.createElement('h1');
		h1.appendChild(document.createTextNode('To'));
		const span = document.createElement('span');
		span.textContent = '-Do';
		h1.appendChild(span);
		h1.appendChild(document.createTextNode(' List'));
		header.appendChild(h1);
		container.appendChild(header);

		const controls = document.createElement('div');
		controls.className = 'controls';

		const inputGroup = document.createElement('div');
		inputGroup.className = 'input-group';
		const taskInput = Object.assign(document.createElement('input'), {
			type: 'text',
			id: 'taskInput',
			placeholder: 'Введите новую задачу...',
			className: 'task-input'
		});
		const taskDate = Object.assign(document.createElement('input'), {
			type: 'date',
			id: 'taskDate',
			className: 'task-date'
		});
		const addBtn = Object.assign(document.createElement('button'), {
			className: 'btn btn-primary',
			id: 'addTaskBtn',
			textContent: 'Добавить задачу'
		});
		inputGroup.append(taskInput, taskDate, addBtn);
		controls.appendChild(inputGroup);

		const filterGroup = document.createElement('div');
		filterGroup.className = 'filter-group';

		const searchBox = document.createElement('div');
		searchBox.className = 'search-box';
		const searchInput = Object.assign(document.createElement('input'), {
			type: 'text',
			id: 'searchInput',
			placeholder: 'Поиск задач...'
		});
		searchBox.appendChild(searchInput);

		const filterButtons = document.createElement('div');
		filterButtons.className = 'filter-buttons';
		const filters = [
			{ text: 'Все', filter: 'all', active: true },
			{ text: 'Активные', filter: 'active' },
			{ text: 'Выполненные', filter: 'completed' }
		];
		filters.forEach(f => {
			const btn = document.createElement('button');
			btn.className = 'btn btn-filter' + (f.active ? ' active' : '');
			btn.dataset.filter = f.filter;
			btn.textContent = f.text;
			btn.addEventListener('click', e => this.setFilter(f.filter));
			filterButtons.appendChild(btn);
		});
		const sortBtn = Object.assign(document.createElement('button'), {
			className: 'btn btn-filter',
			id: 'sortDateBtn',
			textContent: '📅 По дате ↑'
		});
		filterButtons.appendChild(sortBtn);

		filterGroup.append(searchBox, filterButtons);
		controls.appendChild(filterGroup);
		container.appendChild(controls);

		const tasksContainer = document.createElement('div');
		tasksContainer.className = 'tasks-container';

		const stats = document.createElement('div');
		stats.className = 'stats';
		const totalTasks = Object.assign(document.createElement('span'), {
			id: 'totalTasks',
			textContent: 'Всего задач: 0'
		});
		const completedTasks = Object.assign(document.createElement('span'), {
			id: 'completedTasks',
			textContent: 'Выполнено: 0'
		});
		stats.append(totalTasks, completedTasks);

		const taskList = Object.assign(document.createElement('ul'), {
			className: 'task-list',
			id: 'taskList'
		});

		tasksContainer.append(stats, taskList);
		container.appendChild(tasksContainer);
		document.body.appendChild(container);

		this.els = {
			input: taskInput,
			date: taskDate,
			list: taskList,
			search: searchInput,
			sortBtn: sortBtn
		};

		this.els.search.addEventListener('input', e => {
			this.render(this.tasks.filter(t =>
				t.title.toLowerCase().includes(e.target.value.toLowerCase())
			));
		});

		this.els.input.addEventListener('keypress', e => {
			if (e.key === 'Enter') this.addTask();
		});

		addBtn.addEventListener('click', () => this.addTask());
		sortBtn.addEventListener('click', () => this.toggleDateSort());

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
				this.els.list.insertBefore(
					this.draggedItem,
					(e.clientY - rect.top) / (rect.bottom - rect.top) > 0.5
						? taskItem.nextSibling
						: taskItem
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
			this.els.sortBtn.textContent = '📅 По дате';
		});
		this.els.list.addEventListener('dragend', () => {
			if (this.draggedItem) {
				this.draggedItem.classList.remove('dragging');
				this.draggedItem = null;
			}
		});

		this.render();
	}

	showMessage(text, type = 'info') {
		const msg = document.createElement('div');
		msg.className = `toast ${type}`;
		msg.textContent = text;
		document.body.appendChild(msg);
		setTimeout(() => msg.remove(), 2500);
	}

	addTask() {
		const title = this.els.input.value.trim();
		if (!title) {
			this.showMessage('Пожалуйста, введите задачу', 'error');
			return;
		}

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
		if (!task) return;

		const modal = document.createElement('div');
		modal.className = 'modal';

		const modalContent = document.createElement('div');
		modalContent.className = 'modal-content';

		const h3 = document.createElement('h3');
		h3.textContent = 'Редактировать задачу';

		const editTitle = Object.assign(document.createElement('input'), {
			id: 'editTitle',
			value: task.title,
			className: 'task-input'
		});

		const editDate = Object.assign(document.createElement('input'), {
			id: 'editDate',
			type: 'date',
			value: task.date,
			className: 'task-date'
		});

		const modalActions = document.createElement('div');
		modalActions.className = 'modal-actions';

		const saveBtn = Object.assign(document.createElement('button'), {
			id: 'saveEdit',
			className: 'btn btn-primary',
			textContent: 'Сохранить'
		});

		const cancelBtn = Object.assign(document.createElement('button'), {
			id: 'cancelEdit',
			className: 'btn',
			textContent: 'Отмена'
		});

		modalActions.append(saveBtn, cancelBtn);
		modalContent.append(h3, editTitle, editDate, modalActions);
		modal.appendChild(modalContent);
		document.body.appendChild(modal);

		saveBtn.onclick = () => {
			task.title = editTitle.value.trim();
			task.date = editDate.value;
			this.save();
			this.render();
			modal.remove();
		};
		cancelBtn.onclick = () => modal.remove();
		modal.onclick = e => {
			if (e.target === modal) modal.remove();
		};
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
		this.els.sortBtn.textContent = `📅 По дате ${this.currentSort === 'date-asc' ? '↑' : '↓'}`;
		this.render();
	}

	render(tasksToRender = this.tasks) {
		let filtered =
			this.currentFilter === 'active'
				? tasksToRender.filter(t => !t.completed)
				: this.currentFilter === 'completed'
				? tasksToRender.filter(t => t.completed)
				: tasksToRender;

		const sorted = [...filtered].sort((a, b) =>
			this.currentSort === 'date-asc'
				? new Date(a.date) - new Date(b.date)
				: this.currentSort === 'date-desc'
				? new Date(b.date) - new Date(a.date)
				: (a.order || 0) - (b.order || 0)
		);

		this.els.list.replaceChildren();

		if (sorted.length === 0) {
			const empty = document.createElement('div');
			empty.className = 'empty-state';
			const h3 = document.createElement('h3');
			h3.textContent = 'Задач нет';
			const p = document.createElement('p');
			p.textContent =
				this.currentFilter === 'all'
					? 'Добавьте первую задачу'
					: 'Попробуйте изменить фильтр';
			empty.append(h3, p);
			this.els.list.appendChild(empty);
		} else {
			const today = new Date().toISOString().split('T')[0];
			sorted.forEach(t => {
				const li = document.createElement('li');
				const isOverdue = !t.completed && t.date < today;
				li.className = `task-item ${t.completed ? 'completed' : ''} ${
					isOverdue ? 'overdue' : ''
				}`;
				li.draggable = true;
				li.dataset.id = t.id;

				const checkbox = Object.assign(document.createElement('input'), {
					type: 'checkbox',
					className: 'task-checkbox',
					checked: t.completed
				});
				checkbox.addEventListener('change', () => this.toggleComplete(t.id));

				const content = document.createElement('div');
				content.className = 'task-content';
				const title = Object.assign(document.createElement('div'), {
					className: 'task-title',
					textContent: t.title
				});
				const date = Object.assign(document.createElement('div'), {
					className: 'task-date',
					textContent: new Date(t.date).toLocaleDateString('ru-RU', {
						day: '2-digit',
						month: '2-digit',
						year: 'numeric'
					})
				});
				content.append(title, date);

				if (isOverdue) {
					const warn = document.createElement('div');
					warn.className = 'date-warning';
					warn.textContent = '⚠️ Просрочено';
					content.appendChild(warn);
				}

				const actions = document.createElement('div');
				actions.className = 'task-actions';
				const editBtn = Object.assign(document.createElement('button'), {
					className: 'btn-action btn-edit',
					textContent: '✏️'
				});
				editBtn.addEventListener('click', () => this.editTask(t.id));
				const delBtn = Object.assign(document.createElement('button'), {
					className: 'btn-action btn-delete',
					textContent: '🗑️'
				});
				delBtn.addEventListener('click', () => this.deleteTask(t.id));

				actions.append(editBtn, delBtn);
				li.append(checkbox, content, actions);
				this.els.list.appendChild(li);
			});
		}

		const completed = this.tasks.filter(t => t.completed).length;
		document.getElementById('totalTasks').textContent = `Всего задач: ${this.tasks.length}`;
		document.getElementById('completedTasks').textContent = `Выполнено: ${completed}`;
	}

	save() {
		localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
	}
}

const app = new TodoApp();