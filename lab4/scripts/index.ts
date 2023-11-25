import { NotesManager, NoteColor, TodoItem } from "./notes";

const notesManager = new NotesManager();

document.addEventListener("DOMContentLoaded", () => {
  displayNotes();
  document
    .getElementById("noteForm")!
    .addEventListener("submit", handleFormSubmit);
});

const handleFormSubmit = (event: Event) => {
  event.preventDefault();

  const title = (document.getElementById("title") as HTMLInputElement).value;
  const content = (document.getElementById("content") as HTMLTextAreaElement)
    .value;
  const color = (document.getElementById("color") as HTMLSelectElement)
    .value as NoteColor;
  const isPinned = (document.getElementById("isPinned") as HTMLInputElement)
    .checked;

  const tagsString = (document.getElementById("tags") as HTMLInputElement)
    .value;
  const tags = tagsString.split(",").map((tag) => tag.trim());
  const reminderDateString = (
    document.getElementById("reminderDate") as HTMLInputElement
  ).value;
  const reminderDate = reminderDateString ? new Date(reminderDateString) : null;

  const todoItemsString = (
    document.getElementById("todoItems") as HTMLTextAreaElement
  ).value;
  const todoItems: TodoItem[] = todoItemsString
    .split("\n")
    .map((item) => ({ text: item, isDone: false }));

  const note = {
    title,
    content,
    color,
    isPinned,
    createdAt: new Date(),
    tags,
    reminderDate,
    todoList: todoItems,
  };

  notesManager.add(note);
  displayNotes();
};

const searchInput = document.getElementById("searchInput") as HTMLInputElement;

const displayNotes = () => {
  const searchQuery = searchInput.value;

  let notes = notesManager
    .getAll()
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .sort((a, b) => Number(b.isPinned) - Number(a.isPinned));

  if (searchQuery) {
    notes = notes.filter((note) => {
      const noteValues = Object.values(note);
      return noteValues.some((value) => {
        if (typeof value === "string") {
          return value.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return false;
      });
    });
  }

  const notesGrid = document.getElementById("notesGrid")!;
  notesGrid.innerHTML = "";

  notes.forEach((note) => {
    const noteId = note.id;
    const noteElement = document.createElement("div");
    const tagsHtml = note.tags
      .filter((tag) => tag != "")
      .map((tag) => `<span class="tag">#${tag}</span>`)
      .join(" ");
    const todoItemsHtml = note.todoList
      .filter((item) => item)
      .map(
        (item, itemIndex) =>
          `<li><input type="checkbox" class="todo-checkbox" data-noteid="${noteId}" data-itemid="${itemIndex}" ${
            item.isDone ? "checked" : ""
          } /> ${item.text}</li>`
      )
      .join(" ");
    noteElement.classList.add("note", note.color);
    noteElement.setAttribute("data-id", noteId.toString());
    noteElement.innerHTML = `
        <h3>${note.title}</h3>
        <p>${note.content}</p>
        <small>Created: ${new Date(note.createdAt).toLocaleDateString()}</small>
        <ul>${todoItemsHtml}</ul>
        <div class="tags">${tagsHtml}</div>
        <button class="editBtn" data-id="${noteId}">Edit</button>
        <button class="deleteBtn" data-id="${noteId}">Delete</button>
    `;

    notesGrid.appendChild(noteElement);
  });

  attachEventListeners();
};

searchInput.addEventListener("input", displayNotes);

const attachEventListeners = () => {
  document.querySelectorAll(".deleteBtn").forEach((button) => {
    button.addEventListener("click", function () {
      const noteId = parseInt(this.getAttribute("data-id")!);
      notesManager.delete(noteId);
      displayNotes();
    });
  });

  document.querySelectorAll(".editBtn").forEach((button) => {
    button.addEventListener("click", function () {
      const noteId = parseInt(this.getAttribute("data-id")!);
      transformNoteToEditForm(noteId);
    });
  });

  document.querySelectorAll(".todo-checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      const noteId = parseInt(this.getAttribute("data-noteid")!);
      const todoItemId = parseInt(this.getAttribute("data-itemid")!);
      handleTodoItemChange(noteId, todoItemId);
    });
  });
};

const handleTodoItemChange = (noteId: number, todoItemId: number) => {
  const note = notesManager.get(noteId);
  const todoItem = note.todoList[todoItemId];
  todoItem.isDone = !todoItem.isDone;
  notesManager.edit(note);
};

const transformNoteToEditForm = (noteId: number) => {
  const noteToEdit = notesManager.get(noteId);
  const noteElement = document.querySelector(`.note[data-id="${noteId}"]`)!;

  const colorOptions = Object.values(NoteColor)
    .map((color) => `<option value="${color}">${color}</option>`)
    .join("\n");
  const tagsString = noteToEdit.tags.join(", ");

  noteElement.innerHTML = `
        <input type="text" class="editTitle" value="${noteToEdit.title}" />
        <textarea class="editContent">${noteToEdit.content}</textarea>
        <select class="editColor">
            ${colorOptions}
        </select>
        <label>
            <input type="checkbox" class="editIsPinned" ${
              noteToEdit.isPinned ? "checked" : ""
            }/> Pin
        </label>
        <input type="text" class="editTags" value="${tagsString}" />
        <input type="date" class="editReminderDate" value="${
          noteToEdit.reminderDate
            ? noteToEdit.reminderDate.toISOString().split("T")[0]
            : ""
        }" />
        <button class="saveEditBtn" data-id="${noteId}">Save</button>
    `;

  noteElement
    .querySelector(".saveEditBtn")
    .addEventListener("click", () => updateNote(noteId));
};

const updateNote = (noteId: number) => {
  const savedNote = notesManager.get(noteId);
  const noteElement = document.querySelector(`.note[data-id="${noteId}"]`)!;
  const title = (noteElement.querySelector(".editTitle") as HTMLInputElement)
    .value;

  const content = (
    noteElement.querySelector(".editContent") as HTMLTextAreaElement
  ).value;

  const color = (noteElement.querySelector(".editColor") as HTMLSelectElement)
    .value as NoteColor;

  const isPinned = (
    noteElement.querySelector(".editIsPinned") as HTMLInputElement
  ).checked;

  const tagsString = (
    noteElement.querySelector(".editTags") as HTMLInputElement
  ).value;
  const tags = tagsString.split(",").map((tag) => tag.trim());
  const reminderDateString = (
    noteElement.querySelector(".editReminderDate") as HTMLInputElement
  ).value;
  const reminderDate = reminderDateString ? new Date(reminderDateString) : null;

  const note = {
    id: noteId,
    title,
    content,
    color,
    isPinned,
    createdAt: savedNote.createdAt,
    tags,
    reminderDate,
    todoList: savedNote.todoList,
  };

  notesManager.edit(note);
  displayNotes();
};

const ONE_MINUTE = 60 * 1000;

const checkReminders = () => {
  const now = new Date();
  const notes = notesManager.getAll();

  notes.forEach((note) => {
    if (note.reminderDate && new Date(note.reminderDate) <= now) {
      alert(`Reminder for note: ${note.title}`);
      note.reminderDate = null;
      notesManager.edit(note);
    }
  });
};

setInterval(checkReminders, ONE_MINUTE);
