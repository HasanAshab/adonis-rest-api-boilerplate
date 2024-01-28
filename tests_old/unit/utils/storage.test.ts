jest.unmock("Storage");

import Storage from "Storage";
import fs from "fs";

describe("storage", () => {
  it("Should store file", async () => {
    const file = {
      name: "test.png",
      data: fs.readFileSync(fakeFile("image.png").path)
    }
    const path = await Storage.putFile("public/uploads", file);
    const data = fs.readFileSync(path);
    expect(fs.existsSync(path)).toBe(true);
    expect(data).toStrictEqual(file.data);
    fs.unlinkSync(path)
  });
});
