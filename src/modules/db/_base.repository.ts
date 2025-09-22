import { Injectable } from '@nestjs/common';
import {Model, Document, ClientSession} from 'mongoose';

@Injectable()
export abstract class BaseRepository<T extends Document> {
  protected readonly _model: Model<T>;

  protected constructor(model: Model<T>) {
    this._model = model;

    return new Proxy(this, {
      get: (target, prop) => {
        if (typeof target._model[prop as keyof Model<T>] === 'function') {
          return (...args: any[]) => (target._model[prop as keyof Model<T>] as Function).apply(target._model, args);
        }
        return target[prop as keyof this];
      },
    });
  }

  findAll(filter: Record<string, any> = {}, session: ClientSession | null = null) {
    const query = this._model.find(filter).session(session);
    const execOriginal = query.exec.bind(query);
    query.exec = async function execWithPagination(): Promise<any> {
      const data = await execOriginal();
      const total = await query.model.countDocuments(filter).session(session).exec();
      return { data, total };
    };

    return query;
  }
}
