import { model, Schema, Document, Model } from "mongoose";
import HasFactory, { HasFactoryModel } from "App/Plugins/HasFactory";
import { Attachable, Attachment, AttachmentMeta } from "@ioc:Adonis/Mongoose/Plugin/Attachable";

const CategorySchema = new Schema<CategoryDocument>({
  name: {
    required: true,
    type: String
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  icon: {
    required: true,
    type: Attachment
  }
});

CategorySchema.plugin(HasFactory);
CategorySchema.plugin(Attachable);

export interface ICategory {
  name: string;
  slug: string;
  icon: AttachmentMeta;
}

export interface CategoryDocument extends Document, ICategory, MediableDocument {};
interface CategoryModel extends Model<CategoryDocument>, HasFactoryModel {};
export const b = {}
export default model<CategoryDocument, CategoryModel>("Category", CategorySchema);