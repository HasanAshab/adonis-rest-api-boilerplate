import { Types, Document } from "mongoose";

function matchDocumentWithResponse(received: Record<string, any>, doc: Document) {
  doc = doc.toJSON()
  const keys1 = Object.keys(received);
  const keys2 = Object.keys(doc);
  if (keys1.length !== keys2.length) {
    return false;
  }
  for (let key of keys1) {
    if(doc[key] instanceof Date) {
      doc[key] = doc[key].toISOString();
    }
    if (doc[key] instanceof Types.ObjectId){
      doc[key] = doc[key].toString();
    }
    if (typeof doc[key] === "string" && received[key] !== doc[key]){
      return false;
    } 
  }

  return true;
}



expect.extend({
  toEqualDocument(received: Record<string, any>, doc: Document) {
    const docs = Array.isArray(doc) ? doc : [doc];
    const receivedDocs = Array.isArray(received) ? received : [received];
    const pass = docs.every((doc, i) => matchDocumentWithResponse(receivedDocs[i], doc));
    return pass 
      ? { pass }
      : { pass: false, message: () => `Expected: ${JSON.stringify(docs, null, 2)}\n Received: ${JSON.stringify(receivedDocs, null, 2)}` };
  }
});