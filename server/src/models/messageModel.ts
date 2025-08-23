import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  from: string;
  to: string;
  message: string;
}

const MessageSchema: Schema<IMessage> = new Schema(
  {
    from: { type: String, required: true },
    to: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IMessage>('Message', MessageSchema);
