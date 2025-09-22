import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

//ProductDocument definition
export type ProductDocument = HydratedDocument<Product>;

//Schema definition
@Schema({ timestamps: true })
export class Product {
  @Prop({type: String, required: true, unique: true, index: true, trim: true})
  article: string;

  @Prop({type: [String], default: []})
  aliases: string[];

  @Prop({type: Number, default: 0})
  price: number;
}

let _schema = SchemaFactory.createForClass(Product);

//Methods and hooks.


export const ProductSchema = _schema;