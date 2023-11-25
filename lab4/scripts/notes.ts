export const NoteColor = {
  red: "red",
  green: "green",
  blue: "blue",
  yellow: "yellow",
  grey: "grey",
  purple: "purple",
} as const;

export type NoteColor = (typeof NoteColor)[keyof typeof NoteColor];

export interface Note {
  title: string;
  content: string;
  color: NoteColor;
  isPinned: boolean;
  createdAt: Date;
}

export class NotesManager {
  constructor(private readonly storageKey: string = "notes") {}

  public edit(noteId: number, updatedNote: Note): void {
    const notes = this.getAll();
    notes[noteId] = updatedNote;
    localStorage.setItem(this.storageKey, JSON.stringify(notes));
  }

  public delete(noteId: number): void {
    let notes = this.getAll();
    notes = notes.filter((_, index) => index !== noteId);
    localStorage.setItem(this.storageKey, JSON.stringify(notes));
  }

  public add(note: Note): Note {
    const notes = this.getAll();
    notes.push(note);
    const stringifiedNotes = JSON.stringify(notes);
    localStorage.setItem(this.storageKey, stringifiedNotes);
    return note;
  }

  public getAll(): Note[] {
    const notes = localStorage.getItem(this.storageKey);
    return notes ? JSON.parse(notes) : [];
  }

  public get(noteId: number): Note {
    const notes = this.getAll();
    return notes[noteId];
  }
}
