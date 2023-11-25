import { NotesManager, Note, NoteColor } from "./notes";

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

  const note: Note = {
    title,
    content,
    color,
    isPinned,
    createdAt: new Date(),
  };

  notesManager.add(note);
  displayNotes();
};

const displayNotes = () => {
  const notes = notesManager
    .getAll()
    .sort((a, b) => Number(b.isPinned) - Number(a.isPinned));
  const notesGrid = document.getElementById("notesGrid")!;
  notesGrid.innerHTML = "";

  notes.forEach((note, index) => {
    const noteElement = document.createElement("div");
    noteElement.classList.add("note", note.color);
    noteElement.setAttribute("data-id", index.toString());
    noteElement.innerHTML = `
        <h3>${note.title}</h3>
        <p>${note.content}</p>
        <small>Created: ${new Date(note.createdAt).toLocaleDateString()}</small>
        <button class="editBtn" data-id="${index}">Edit</button>
        <button class="deleteBtn" data-id="${index}">Delete</button>
    `;

    notesGrid.appendChild(noteElement);
  });

  attachEventListeners();
};

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
};

const transformNoteToEditForm = (noteId: number) => {
  const noteToEdit = notesManager.getAll()[noteId];
  const noteElement = document.querySelector(`.note[data-id="${noteId}"]`)!;

  const colorOptions = Object.values(NoteColor)
    .map((color) => `<option value="${color}">${color}</option>`)
    .join("\n");

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

  const note: Note = {
    title,
    content,
    color,
    isPinned,
    createdAt: savedNote.createdAt,
  };

  notesManager.edit(noteId, note);
  displayNotes();
};
