import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import {
  createCharacter,
  listCharacters,
} from "@/lib/characters/db";
import {
  CharacterPayload,
  GameSystemKey,
  StatField,
  SkillField,
} from "@/lib/characters/types";

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
    notes: typeof payload.notes === "string" ? payload.notes : "",
    stats: normalizeFields<StatField>(payload.stats),
    skills: normalizeFields<SkillField>(payload.skills),
    avatarUrl: typeof payload.avatarUrl === "string" ? payload.avatarUrl : undefined,
    isPublic: typeof payload.isPublic === "boolean" ? payload.isPublic : false,
  };
}

export async function GET(request: Request) {
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
    
    const characters = await listCharacters(userId);
    return NextResponse.json(characters, { status: 200 });
  } catch (error) {
    console.error("Failed to list characters", error);
    return NextResponse.json(
      { error: "Failed to load characters" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    const character = await createCharacter(userId, payload);

    return NextResponse.json(character, { status: 201 });
  } catch (error) {
    console.error("Failed to create character", error);
    return NextResponse.json(
      { error: "Failed to create character" },
      { status: 500 }
    );
  }
}
