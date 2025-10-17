import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import {
  deleteCharacter,
  getCharacter,
  updateCharacter,
} from "@/lib/characters/db";
import { CharacterPayload } from "@/lib/characters/types";

import type { GameSystemKey, StatField, SkillField } from "@/lib/characters/types";

const VALID_SYSTEMS: GameSystemKey[] = [
  "dnd",
  "pathfinder",
  "starfinder",
  "shadowdark",
  "other",
];

function isGameSystem(value: unknown): value is GameSystemKey {
  return typeof value === "string" && (VALID_SYSTEMS as string[]).includes(value);
}

function normalizeFields<T extends StatField | SkillField>(
  value: unknown
): T[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => ({
    name: typeof item?.name === "string" ? item.name : "",
    value: typeof item?.value === "string" ? item.value : "",
  })) as T[];
}

function parseCharacterPayload(data: unknown): CharacterPayload | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const payload = data as Partial<CharacterPayload>;

  if (!isGameSystem(payload.system)) {
    return null;
  }

  return {
    system: payload.system,
    name: typeof payload.name === "string" ? payload.name : "",
    campaign: typeof payload.campaign === "string" ? payload.campaign : "",
    alignment: typeof payload.alignment === "string" ? payload.alignment : undefined,
    race: typeof payload.race === "string" ? payload.race : undefined,
    background: typeof payload.background === "string" ? payload.background : undefined,
    level: typeof payload.level === "string" ? payload.level : undefined,
    class: typeof payload.class === "string" ? payload.class : undefined,
    role: typeof payload.role === "string" ? payload.role : undefined,
    age: typeof payload.age === "string" ? payload.age : undefined,
    height: typeof payload.height === "string" ? payload.height : undefined,
    weight: typeof payload.weight === "string" ? payload.weight : undefined,
    eyes: typeof payload.eyes === "string" ? payload.eyes : undefined,
    skin: typeof payload.skin === "string" ? payload.skin : undefined,
    hair: typeof payload.hair === "string" ? payload.hair : undefined,
    notes: typeof payload.notes === "string" ? payload.notes : "",
    stats: normalizeFields<StatField>(payload.stats),
    skills: normalizeFields<SkillField>(payload.skills),
    avatarUrl: typeof payload.avatarUrl === "string" ? payload.avatarUrl : undefined,
    isPublic: typeof payload.isPublic === "boolean" ? payload.isPublic : false,
  };
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const cookieStore = await cookies();
    const userId = searchParams.get("userId") || cookieStore.get("userId")?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required. Please log in." },
        { status: 401 }
      );
    }
    
    const { id } = await context.params;
    const character = await getCharacter(userId, id);

    if (!character) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 });
    }

    return NextResponse.json(character, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch character", error);
    return NextResponse.json(
      { error: "Failed to fetch character" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const cookieStore = await cookies();
    const userId = searchParams.get("userId") || cookieStore.get("userId")?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required. Please log in." },
        { status: 401 }
      );
    }
    
    const data = await request.json();
    const payload = parseCharacterPayload(data);

    if (!payload) {
      return NextResponse.json(
        { error: "Invalid character payload" },
        { status: 400 }
      );
    }

    const { id } = await context.params;
    const updatedCharacter = await updateCharacter(userId, id, payload);

    if (!updatedCharacter) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 });
    }

    return NextResponse.json(updatedCharacter, { status: 200 });
  } catch (error) {
    console.error("Failed to update character", error);
    return NextResponse.json(
      { error: "Failed to update character" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const cookieStore = await cookies();
    const userId = searchParams.get("userId") || cookieStore.get("userId")?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required. Please log in." },
        { status: 401 }
      );
    }
    
    const { id } = await context.params;
    const deleted = await deleteCharacter(userId, id);

    if (!deleted) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete character", error);
    return NextResponse.json(
      { error: "Failed to delete character" },
      { status: 500 }
    );
  }
}
