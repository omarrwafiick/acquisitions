import { db } from '#config/database.js';

export const create = async (table, payload) => {
  const result = await db
    .insert(table)
    .values(payload)
    .returning();

  return result?.[0] || null;
};

export const findOne = async (table, whereClause) => {
  const result = await db
    .select()
    .from(table)
    .where(whereClause)
    .limit(1);

  return result?.[0] || null;
};

export const findMany = async (table, whereClause) => {
  const result = await db
    .select()
    .from(table)
    .where(whereClause);

  return result || [];
};

export const findOneWithJoin = async (
  table,
  relatedTable,
  whereClause,
  joinClause,
  fields
) => {
  let query = db
    .select(fields)
    .from(table)
    .innerJoin(relatedTable, joinClause);

  if (whereClause) {
    query = query.where(whereClause);
  }

  const result = await query.limit(1);

  return result?.[0] || null;
};

export const updateOne = async (table, payload, whereClause) => {
  const result = await db
    .update(table)
    .set(payload)
    .where(whereClause)
    .returning();

  return result?.[0] || null;
};

export const deleteOne = async (table, whereClause) => {
  const result = await db
    .delete(table)
    .where(whereClause)
    .returning();

  return result?.[0] || null;
};