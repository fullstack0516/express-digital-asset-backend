import { Request, Response } from 'express';
import { asyncForEach } from '../utils/helpers';
import { mongoDb } from '../utils/helpers-mongo';

export const resetDB = async (req: Request, res: Response) => {

    const collections = await mongoDb.collections();

    await asyncForEach(collections, async (collection) => {
      await collection.deleteMany({})
    });
  
    return res.json({ success: true });
}
