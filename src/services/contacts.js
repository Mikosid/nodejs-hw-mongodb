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

export const getContactById = (id) => {
  if (!id) {
    throw new Error('Contact ID is required');
  }
  return ContactsCollection.findById(id);
};

export const getContactByIdAndUserId = (id, userId) =>
  ContactsCollection.findOne({ _id: id, userId });

export const addContact = (data) => ContactsCollection.create(data);

export const updateContact = async ({ _id, userId, payload, options = {} }) => {
  const rawResult = await ContactsCollection.findOneAndUpdate(
    { _id, userId },
    payload,
    {
      ...options,
      new: true,
    },
  );

  if (!rawResult) return null;

  return rawResult;
};

export const deleteContact = async ({ _id, userId }) =>
  ContactsCollection.findOneAndDelete({ _id, userId });
