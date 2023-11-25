export const NoteColor = {
  red: "red",
  green: "green",
  blue: "blue",
  yellow: "yellow",
  grey: "grey",
  purple: "purple",
} as const;

export type NoteColor = (typeof NoteColor)[keyof typeof NoteColor];

export interface TodoItem {
  text: string;
  isDone: boolean;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  color: NoteColor;
  isPinned: boolean;
  createdAt: Date;
  tags: string[];
  reminderDate: Date | null;
  todoList: TodoItem[];
}

export type NoteCreateInput = Omit<Note, "id" | "createdAt">;

export class NotesManager {
  private highestId: number;

  constructor(private readonly storageKey: string = "notes") {
    this.highestId = this.initializeHighestId();
  }

  public edit(updatedNote: Note): void {
    const { id } = updatedNote;

    const notes = this.getAllNotes();
    if (notes[id]) {
      notes[id] = updatedNote;
      localStorage.setItem(this.storageKey, JSON.stringify(notes));
    }
  }

  public delete(noteId: number): void {
    const notes = this.getAllNotes();
    if (notes[noteId]) {
      delete notes[noteId];
      localStorage.setItem(this.storageKey, JSON.stringify(notes));
    }
  }

  public add(note: NoteCreateInput): Note {
    const notes = this.getAllNotes();
    const newId = ++this.highestId;
    const newNote: Note = { ...note, id: newId, createdAt: new Date() };
    notes[newId] = newNote;
    localStorage.setItem(this.storageKey, JSON.stringify(notes));
    return newNote;
  }

  public getAll(): Note[] {
    const notes = this.getAllNotes();
    return Object.values(notes).map((note) => ({
      ...note,
      createdAt: new Date(note.createdAt),
      reminderDate: note.reminderDate ? new Date(note.reminderDate) : null,
    }));
  }

  public get(noteId: number): Note | undefined {
    const notes = this.getAllNotes();
    return notes[noteId];
  }

  private initializeHighestId(): number {
    const notes = this.getAllNotes();
    return Math.max(0, ...Object.keys(notes).map(Number));
  }

  private getAllNotes(): Record<number, Note> {
    const notesString = localStorage.getItem(this.storageKey);
    return notesString ? JSON.parse(notesString) : {};
  }
}
