const datePicker = document.getElementById('datePicker');
const noteInput = document.getElementById('noteInput');
const notesContainer = document.getElementById('notesContainer');

document.addEventListener('DOMContentLoaded', () => {
    const today = new Date().toISOString().split('T')[0];
    datePicker.value = today;
    loadNotes(today);
    noteInput.focus(); // Устанавливаем фокус на поле ввода при загрузке страницы
});

datePicker.addEventListener('change', (event) => {
    const selectedDate = event.target.value;
    loadNotes(selectedDate);
});

noteInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter' && noteInput.textContent.trim()) {
        event.preventDefault(); // Предотвращаем переход на новую строку
        addNote(noteInput.textContent);
        noteInput.textContent = ''; // Очищаем поле ввода
        updateCursor(); // Обновляем курсор
    }
});

function updateCursor() {
    const cursor = document.createElement('span');
    cursor.classList.add('cursor');
    noteInput.appendChild(cursor);
    setTimeout(() => {
        cursor.remove();
    }, 100); // Удаляем курсор через 100 мс
}

function addNote(text) {
    const isImportant = text.startsWith("!"); // Проверяем, начинается ли текст с "!"
    const noteItem = document.createElement('div');
    noteItem.classList.add('note');
    noteItem.setAttribute('draggable', true);

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';

    const noteText = document.createElement('span');
    noteText.contentEditable = true; // Делаем текст редактируемым
    noteText.textContent = text.replace(/^!/, ''); // Убираем "!" из текста
    if (isImportant) {
        noteText.style.color = 'crimson'; // Устанавливаем цвет текста на "crimson"
    }

    const dragIcon = document.createElement('span');
    dragIcon.classList.add('drag-icon');
    dragIcon.textContent = '⇅'; // Знак для перетаскивания

    dragIcon.addEventListener('mousedown', (event) => {
        event.stopPropagation(); // Останавливаем событие, чтобы не вызывался клик на задаче
    });

    checkbox.addEventListener('change', () => {
        noteText.style.textDecoration = checkbox.checked ? 'line-through' : 'none'; // Зачеркиваем текст
        saveNotes(datePicker.value);
    });

    noteText.addEventListener('keydown', (event) => {
        if (event.key === 'Backspace') {
            // Проверяем, если текст пуст, удаляем элемент
            if (noteText.textContent.trim() === '') {
                notesContainer.removeChild(noteItem);
                saveNotes(datePicker.value);
            }
        }
    });

    noteItem.addEventListener('dragstart', (event) => {
        event.dataTransfer.setData('text/plain', null); // Для Firefox
        noteItem.classList.add('dragging'); // Добавляем класс для стильного эффекта
    });

    noteItem.addEventListener('dragend', () => {
        noteItem.classList.remove('dragging'); // Убираем класс при окончании перетаскивания
    });

    notesContainer.addEventListener('dragover', (event) => {
        event.preventDefault(); // Разрешаем сброс
        const draggingNote = document.querySelector('.dragging');
        const afterElement = getDragAfterElement(notesContainer, event.clientY);
        if (afterElement == null) {
            notesContainer.appendChild(draggingNote);
        } else {
            notesContainer.insertBefore(draggingNote, afterElement);
        }
    });

    noteItem.appendChild(checkbox);
    noteItem.appendChild(noteText);
    noteItem.appendChild(dragIcon);
    notesContainer.appendChild(noteItem);

    // Сохраняем заметку в localStorage
    saveNotes(datePicker.value);
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.note:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function saveNotes(date) {
    const notes = Array.from(notesContainer.children).map(note => {
        const checkbox = note.querySelector('input[type="checkbox"]');
        const text = note.querySelector('span').textContent;
        return { text, checked: checkbox.checked };
    });
    localStorage.setItem(date, JSON.stringify(notes));
}

function loadNotes(date) {
    const notes = JSON.parse(localStorage.getItem(date));
    notesContainer.innerHTML = ''; // Очищаем предыдущие заметки
    if (notes) {
        notes.forEach(note => addNoteWithCheckbox(note.text, note.checked)); // Восстанавливаем заметки
    }
}

function addNoteWithCheckbox(text, isChecked) {
    const noteItem = document.createElement('div');
    noteItem.classList.add('note');
    noteItem.setAttribute('draggable', true);

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = isChecked;

    const noteText = document.createElement('span');
    noteText.contentEditable = true; // Делаем текст редактируемым
    noteText.textContent = text;
    if (text.startsWith("!")) {
        noteText.style.color = 'crimson'; // Устанавливаем цвет текста на "crimson"
        noteText.textContent = noteText.textContent.replace(/^!/, ''); // Убираем "!" из текста
    }
    if (isChecked) {
        noteText.style.textDecoration = 'line-through'; // Зачеркиваем текст, если задача выполнена
    }

    const dragIcon = document.createElement('span');
    dragIcon.classList.add('drag-icon');
    dragIcon.textContent = '⇅'; // Знак для перетаскивания

    dragIcon.addEventListener('mousedown', (event) => {
        event.stopPropagation(); // Останавливаем событие, чтобы не вызывался клик на задаче
    });

    checkbox.addEventListener('change', () => {
        noteText.style.textDecoration = checkbox.checked ? 'line-through' : 'none'; // Зачеркиваем текст
        saveNotes(datePicker.value);
    });

    noteText.addEventListener('keydown', (event) => {
        if (event.key === 'Backspace') {
            // Проверяем, если текст пуст, удаляем элемент
            if (noteText.textContent.trim() === '') {
                notesContainer.removeChild(noteItem);
                saveNotes(datePicker.value);
            }
        }
    });

    noteItem.addEventListener('dragstart', (event) => {
        event.dataTransfer.setData('text/plain', null); // Для Firefox
        noteItem.classList.add('dragging'); // Добавляем класс для стильного эффекта
    });

    noteItem.addEventListener('dragend', () => {
        noteItem.classList.remove('dragging'); // Убираем класс при окончании перетаскивания
    });

    notesContainer.addEventListener('dragover', (event) => {
        event.preventDefault(); // Разрешаем сброс
        const draggingNote = document.querySelector('.dragging');
        const afterElement = getDragAfterElement(notesContainer, event.clientY);
        if (afterElement == null) {
            notesContainer.appendChild(draggingNote);
        } else {
            notesContainer.insertBefore(draggingNote, afterElement);
        }
    });

    noteItem.appendChild(checkbox);
    noteItem.appendChild(noteText);
    noteItem.appendChild(dragIcon);
    notesContainer.appendChild(noteItem);
}