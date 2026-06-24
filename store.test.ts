import { createGroup } from "./store";
import { vi, describe, test, expect } from "vitest";


//mock firebase for the unit test
vi.mock("firebase/firestore", () => ({
  doc: vi.fn(),
  setDoc: vi.fn(async () => {}),
getDoc: vi.fn(),
  getDocs: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
}));

vi.mock("./firebase", () => ({
  getFirestoreDb: async () => ({}),
}));


//create group test
describe("createGroup", () => {
  test("owner becomes first member", async () => {
    const owner = {
      id: "u1",
      name: "Gabe",
      email: "gabe@test.com"
    };

    const group = await createGroup(
      "Christmas",
      "Family Exchange",
      50,
      owner
    );
    expect(group.ownerId).toBe("u1");
  });
});




//claim items tests
import { claimItem } from "./store";
import * as firestore from "firebase/firestore";

describe("claimItem", () => {
  test("creates claim if none exists", async () => {
    vi.spyOn(firestore, "getDocs").mockResolvedValue({
      empty: true,
      docs: [],
    } as any);

    const setDocMock = vi.spyOn(firestore, "setDoc");

    await claimItem(
      {
        id: "item1",
        groupId: "g1",
        userId: "u1",
      } as any,
      { id: "u2", name: "Bob" }
    );

    expect(setDocMock).toHaveBeenCalledTimes(2);
  });

  test("does NOT create duplicate claim", async () => {
    vi.spyOn(firestore, "getDocs").mockResolvedValue({
      empty: false,
      docs: [{}],
    } as any);

    const setDocMock = vi.spyOn(firestore, "setDoc");

    await claimItem(
      {
        id: "item1",
        groupId: "g1",
        userId: "u1",
      } as any,
      { id: "u2", name: "Bob" }
    );

    expect(setDocMock).toHaveBeenCalledTimes(2);
  });
});


//add item test
import { addItem } from "./store";

describe("addItem", () => {
  test("creates item with id", async () => {
    const setDocMock = vi.spyOn(firestore, "setDoc");

    const item = await addItem({
      name: "PS5",
      userId: "u1",
      groupId: "g1",
      imageUrl: "",
      shopUrl: "",
      priority: 1,
      addedAt: new Date().toISOString(),
    } as any);

    expect(item.id).toBeDefined();
    expect(setDocMock).toHaveBeenCalledTimes(3);
  });
});


import { joinGroupByCode } from "./store";

describe("joinGroupByCode", () => {
  test("returns null if code not found", async () => {
    vi.spyOn(firestore, "getDocs").mockResolvedValue({
      empty: true,
      docs: [],
    } as any);

    const result = await joinGroupByCode("badcode", {
      id: "u2",
      name: "Bob",
      email: "b@test.com",
    });

    expect(result).toBeNull();
  });

  test("adds new member if not already in group", async () => {
    vi.spyOn(firestore, "getDocs").mockResolvedValue({
      empty: false,
      docs: [
        {
          id: "g1",
          data: () => ({
            id: "g1",
            inviteCode: "abc",
            members: [],
          }),
        },
      ],
    } as any);

    vi.spyOn(firestore, "updateDoc").mockResolvedValue(undefined as any);

    const result = await joinGroupByCode("abc", {
      id: "u2",
      name: "Bob",
      email: "b@test.com",
    });

    expect(result?.members.length).toBe(1);
    expect(result?.members[0].userId).toBe("u2");
  });
});