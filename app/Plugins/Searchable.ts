import { Schema, Document, Query } from 'mongoose';

interface SearchableDocument extends Document {
	// search(query: string): Query;
}

export default function Searchable(schema: Schema) {
	schema.statics.search = function (query: string) {
		return this.find(
			{ $text: { $search: query } },
			{ score: { $meta: 'textScore' } },
		)
			.sort({ score: { $meta: 'textScore' } })
			.select('-score');
	};
}
