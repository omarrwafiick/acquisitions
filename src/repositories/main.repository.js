import { db } from '#config/database.js';

export const create = async (table, payload) => {
  const [row] = await db
    .insert(table)
    .values(payload)
    .returning();

  return row;
};

export const findOne = async (table, whereClause) => {
  const [row] = await db
    .select()
    .from(table)
    .where(whereClause)
    .limit(1);

  return row;
};

export const findOneWithJoin = async (table, relatedTable, whereClause, joinClause, fields) => {
  const [row] = await db
    .select(fields)
    .from(table)
    .innerJoin(relatedTable, joinClause)
    .where(whereClause)
    .limit(1);

  return row;
};

export const findMany = async (table, whereClause) => {
  return db
    .select()
    .from(table)
    .where(whereClause);
};

export const updateOne = async (table, payload, whereClause) => {
  const [row] = await db
    .update(table)
    .set(payload)
    .where(whereClause)
    .returning();

  return row;
};

export const deleteOne = async (table, whereClause) => {
  return db
    .delete(table)
    .where(whereClause);
};