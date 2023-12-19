import { model, Schema, Document, Model } from "mongoose";
import HasFactory, { HasFactoryModel } from "App/Plugins/HasFactory";
import Mediable, { MediableDocument } from "App/Plugins/Mediable";

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
    type: String
  }
});

CategorySchema.plugin(HasFactory);
CategorySchema.plugin(Mediable);

export interface ICategory {
  name: string;
  slug: string;
  icon: string;
}

export interface CategoryDocument extends Document, ICategory, MediableDocument {};
interface CategoryModel extends Model<CategoryDocument>, HasFactoryModel {};
export const b = {}
export default model<CategoryDocument, CategoryModel>("Category", CategorySchema);