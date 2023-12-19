import { Schema, Document } from "mongoose";
import expect from "expect";

/**
 * Plugin to add test helpers
 */
export default function Testable(schema: Schema) {
  schema.static("assertCount", async function(expectedCount: number) {
    expect(await this.count()).toBe(expectedCount);
  });
    
  schema.static("assertHas", async function(data: object) {
    const document = await this.findOne(data);
    expect(document).not.toBeNull();
  });
  
  schema.static("assertMissing", async function(data: object) {
    const document = await this.findOne(data);
    expect(document).toBeNull();
  });
  
  schema.static("assertDocumentExists", async function(document: Document) {
    expect(await document.exists).toBe(true);
  });
}