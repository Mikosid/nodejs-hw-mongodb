import ContactsCollection from '../db/models/Contact.js';

export const getContacts = () => ContactsCollection.find();

export const getContactsById = (id) => ContactsCollection.findById(id);
