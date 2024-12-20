import createHttpError from 'http-errors';
import * as path from 'node:path';

import * as contactServices from '../services/contacts.js';

import { parsePaginationParams } from '../utils/parsePaginationParams.js';

import { parseSortParams } from '../utils/parseSortParams.js';
import { sortByList } from '../db/models/Contact.js';
import { parseContactFilterParams } from '../utils/parseContactFilterParams.js';
import { saveFileToUploadDir } from '../utils/saveFileToUploadDir.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';
import { env } from '../utils/env.js';

const enableCloudinary = env('ENABLE_CLOUDINARY');

export const getContactsController = async (req, res) => {
  const { page, perPage } = parsePaginationParams(req.query);
  const { sortBy, sortOrder } = parseSortParams(req.query, sortByList);
  const filter = parseContactFilterParams(req.query);
  const { _id: userId } = req.user;
  filter.userId = userId;

  const data = await contactServices.getContacts({
    page,
    perPage,
    sortBy,
    sortOrder,
    filter,
  });

  res.json({
    status: 200,
    message: 'Successfuly find contacts',
    data,
  });
};

export const getContactByIdController = async (req, res) => {
  const { id } = req.params;
  const data = await contactServices.getContactById(id);

  if (!data) {
    throw createHttpError(404, `Contact with id=${id} not found`);
  }

  res.json({
    status: 200,
    message: `Successfully found contact with id=${id}!`,
    data,
  });
};

export const addContactController = async (req, res) => {
  const { _id: userId } = req.user;
  let photo = null;

  if (req.file) {
    if (enableCloudinary === 'true') {
      photo = await saveFileToCloudinary(req.file, 'photo');
    } else {
      await saveFileToUploadDir(req.file);
      photo = path.join(req.file.filename);
    }
  }

  const data = await contactServices.addContact({
    ...req.body,
    photo,
    userId,
  });
  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data,
  });
};

export const upsertContactByIdController = async (req, res, next) => {
  const { id: contactId } = req.params;
  const { _id: userId } = req.user;
  let photo = null;

  if (req.file) {
    if (enableCloudinary === 'true') {
      photo = await saveFileToCloudinary(req.file, 'photo');
    } else {
      await saveFileToUploadDir(req.file);
      photo = path.join(req.file.filename);
    }
  }

  const { name, phoneNumber, contactType } = req.body;

  if (!contactId && (!name || !phoneNumber || !contactType)) {
    return next(
      createHttpError(
        400,
        'Name, Phone Number, and Contact Type are required for creating a new contact!',
      ),
    );
  }

  const result = await contactServices.updateContact({
    _id: contactId,
    userId,
    payload: {
      ...req.body,
      photo,
    },
    options: { upsert: true },
  });

  if (!result) {
    return next(createHttpError(404, `Contact with id=${contactId} not found`));
  }

  const status = result.isNew ? 201 : 200;

  res.status(status).json({
    status,
    message: result.isNew
      ? 'Successfully created a contact!'
      : 'Successfully updated the contact!',
    data: result.contact,
  });
};

export const patchContactController = async (req, res, next) => {
  const { id: contactId } = req.params;
  const { _id: userId } = req.user;
  let photo = null;

  if (req.file) {
    if (enableCloudinary === 'true') {
      photo = await saveFileToCloudinary(req.file, 'photo');
    } else {
      await saveFileToUploadDir(req.file);
      photo = path.join(req.file.filename);
    }
  }

  const result = await contactServices.updateContact({
    _id: contactId,
    userId,
    payload: {
      ...req.body,
      ...(photo && { photo }),
    },
  });

  if (!result) {
    return next(createHttpError(404, `Contact with id=${contactId} not found`));
  }

  res.json({
    status: 200,
    message: 'Successfully patched the contact!',
    // data: result.contact,
    data: result,
  });
};

export const deleteContactController = async (req, res) => {
  const { id: _id } = req.params;
  const { _id: userId } = req.user;

  const data = await contactServices.deleteContact({ _id, userId });

  if (!data) {
    throw createHttpError(404, `Contact with id=${_id} not found`);
  }

  res.status(204).send();
};
