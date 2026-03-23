import { prisma } from "../../utils/prisma.js";
import type { Note } from "../../../generated/prisma/client.js";

interface GetNotesInput {
  page: number;
  limit: number;
  search?: string | undefined;
  isArchived?: boolean | undefined;
}

interface CreateNoteInput {
  ownerId: string;
  title: string;
  content?: string | undefined;
}

interface UpdateNoteInput {
  title?: string | undefined;
  content?: string | undefined;
  isArchived?: boolean | undefined;
}

export class NoteService {
  /**
   * CREATE: Inserts a new note into the database.
   * Notice how we use the 'Note' type from Prisma as the return type!
   */
  static async createNote(data: CreateNoteInput): Promise<Note> {
    const newNote = await prisma.note.create({
      data: {
        ownerId: data.ownerId,
        title: data.title, // Fallback if no title is provided
        content: data.content ?? null, // Prisma expects null, not undefined, for empty String? fields
      },
      // You could also use `include` here if you wanted Prisma to fetch
      // the User (owner) details alongside the new Note in one query!
    });

    return newNote;
  }

  static async getNotes(params: GetNotesInput) {
    const { page, limit, search, isArchived } = params;

    // 1. Build dynamic Prisma 'where' clause
    const whereClause: any = {};

    if (search) {
      whereClause.title = { contains: search, mode: "insensitive" };
    }

    if (isArchived !== undefined) {
      whereClause.isArchived = isArchived;
    }

    // 2. Execute Offset-Pagination using 'skip' and 'take'
    const offset = (page - 1) * limit;

    const notes = await prisma.note.findMany({
      where: whereClause,
      skip: offset,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const totalNotesCount = await prisma.note.count({
      where: whereClause,
    });

    // 3. Return a clean API envelope
    return {
      meta: {
        page,
        limit,
        totalCount: totalNotesCount,
        totalPages: Math.ceil(totalNotesCount / limit),
      },
      data: notes,
    };
  }

  static async getNoteById(id: string) {
    // TODO: Fetch specific note using Prisma.
    // Hint: return prisma.note.findUnique({ where: { id } });
    return prisma.note.findUnique({
      where: { id },
      include: { actionItems: true },
    });
  }

  static async updateNote(id: string, data: UpdateNoteInput) {
    // Build update payload safely for Prisma exactOptionalPropertyTypes
    const payload: any = {};
    if (data.title !== undefined) payload.title = data.title;
    if (data.content !== undefined) payload.content = data.content;
    if (data.isArchived !== undefined) payload.isArchived = data.isArchived;

    // We must return the Promise so the controller can `await` it!
    return await prisma.note.update({
      where: { id },
      data: payload,
    });
  }

  static async deleteNote(id: string) {
    // We must return the Promise so the controller can `await` it!
    return await prisma.note.delete({
      where: { id },
    });
  }

  static async createActionItems(noteId: string, descriptions: string[]) {
    const actionItemsData = descriptions.map((desc) => ({
      noteId,
      description: desc,
    }));
    await prisma.actionItem.createMany({
      data: actionItemsData,
    });
    return prisma.actionItem.findMany({
      where: { noteId },
    });
  }

  static async updateActionItem(actionItemId: string, isCompleted: boolean) {
    return prisma.actionItem.update({
      where: { id: actionItemId },
      data: { isCompleted },
    });
  }

  static async deleteActionItem(actionItemId: string) {
    return prisma.actionItem.delete({
      where: { id: actionItemId },
    });
  }
}
