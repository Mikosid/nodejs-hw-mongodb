import ContactsCollection from '../db/models/Contact.js';

import { calculatePaginationData } from '../utils/calculatePaginationData.js';

export const getContacts = async ({
  page = 1,
  perPage = 10,
  sortBy = '_id',
  sortOrder = 'asc',
  filter = {},
}) => {
  const skip = (page - 1) * perPage;

  const query = ContactsCollection.find(filter);
  if (filter.userId) {
    query.where('userId').equals(filter.userId);
  }

  const data = await query
    .skip(skip)
    .limit(perPage)
    .sort({ [sortBy]: sortOrder });

  const totalItems = await ContactsCollection.countDocuments(filter);
  const paginationData = calculatePaginationData({
    page,
    perPage,
    totalItems,
  });

  return {
    data,
    ...paginationData,
  };
};

export const getContactsById = (id) => ContactsCollection.findById(id);

export const addContact = (data) => ContactsCollection.create(data);

export const updateContact = async ({ _id, payload, options = {} }) => {
  const rawResult = await ContactsCollection.findOneAndUpdate(
    { _id },
    payload,
    {
      ...options,
      includeResultMetadata: true,
    },
  );

  if (!rawResult || !rawResult.value) return null;

  return {
    data: rawResult.value,
    isNew: Boolean(rawResult.lastErrorObject.upserted),
  };
};

export const deleteContact = async (filter) =>
  ContactsCollection.findOneAndDelete(filter);
