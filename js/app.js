(function (window) {
	'use strict';

	const filters = {
		all(todos) {
			return todos
		},
		active(todos) {
			return todos.filter(todo => !todo.completed)
		},
		completed(todos) {
			return todos.filter(todo => todo.completed)
		}
	}
	const createStorage = key => {
		return {
			get() {
				return JSON.parse(localStorage.getItem(key)) || []
			},
			set(todos) {
				localStorage.setItem(key, JSON.stringify(todos))
			}
		}
	}
	const todosStorage = createStorage('TODOS')
	window.vm = new Vue({
		el: '#app',
		data: {
			todos: todosStorage.get(),
			newTodo: '', //新增输入框的内容
			editingTodo: null, //正在编辑的todo
			titleBeforeEdit: '', //编辑todo前的title
			selectType: 'all'
		},
		computed: {
			remaining() { //剩余待办的个数
				return filters.active(this.todos).length
			},
			allDone: { //全部事项是否都完成
				get() {
					return this.remaining < 1
				},
				set(value) {
					this.todos.forEach(todo => todo.completed = value)
				}
			},
			filterTodo() {
				return filters[this.selectType](this.todos)
			}
		},
		methods: {
			pluralize(word) { //处理剩余待办个数单位
				return word + (this.remaining === 1 ? '' : 's')
			},
			addTodo() { //添加新todo
				const value = this.newTodo.trim()
				if (!value) return
				this.todos.push({ id: this.todos.length + 1, title: value, completed: false })
				this.newTodo = ''
			},
			removeTodo(todo) { //删除某个todo
				const todos = this.todos
				todos.splice(todos.indexOf(todo), 1)
			},
			cleanCompleted() { //清空已完成
				// this.todos = this.todos.filter(todo => !todo.completed)
				const todos = this.todos
				let index = this.todos.length
				while (index--) if (todos[index].completed) this.removeTodo(todos[index])
			},
			editTodo(todo) { //触发编辑时，保存todo信息
				this.editingTodo = todo
				this.titleBeforeEdit = todo.title
			},
			cancelEdit(todo) { //取消编辑，还原状态与内容
				todo.title = this.titleBeforeEdit
				this.editingTodo = null
				this.titleBeforeEdit = ''
			},
			saveTodo(todo) { //保存编辑的todo
				if (!this.editingTodo) return //因为回车也会触发点击事件，所以要检测一下
				this.editingTodo = null
				this.titleBeforeEdit = ''
				const todos = this.todos
				if (!todo.title) {
					this.removeTodo(todo)
					return
				}
				todo.title = todo.title.trim()
			}
		},
		directives: { //自定义指令，根据数据判断当前编辑的todo文本框是否获取焦点
			'todo-focus'(el, binding) {
				if (binding.value) el.focus()
			}
		},
		watch: {
			todos: {
				deep: true,
				handler: todosStorage.set
			}
		}
	})
})(window);
