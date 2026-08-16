import mongoose, { Document, Schema } from 'mongoose';

export interface IJobListing extends Document {
	title: string;
	company: string;
	location: string;
	category: 'Web Development' | 'AI / ML' | 'Mobile Development';
	skills: string[];
	description: string;
	requirements: string[];
	salary?: string;
	createdAt: Date;
	updatedAt: Date;
}

const JobListingSchema = new Schema<IJobListing>(
	{
		title: { type: String, required: true, trim: true },
		company: { type: String, required: true, trim: true },
		location: { type: String, required: true, trim: true },
		category: {
			type: String,
			required: true,
			enum: ['Web Development', 'AI / ML', 'Mobile Development'],
		},
		skills: [{ type: String, required: true, trim: true }],
		description: { type: String, required: true, trim: true },
		requirements: [{ type: String, required: true, trim: true }],
		salary: { type: String, trim: true },
	},
	{ timestamps: true }
);

JobListingSchema.index({ title: 'text', company: 'text', skills: 'text' });

export default mongoose.model<IJobListing>('JobListing', JobListingSchema);
