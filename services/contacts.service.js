const contactsModel = require("../models/contacts.model");
const db = require("../config/db");
const embeddingService = require("../services/embedding.service");
exports.getUserContacts=async(userId)=>{
  return contactsModel.fetchContacts(userId)
}

exports.resyncContacts = async (allContacts, userId) => {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    for (const contact of allContacts) {
    const { phone, displayName } = contact;
      if (!phone) continue;

      // 1️⃣ Check if contact exists
      let dbContact = await contactsModel.getContactByPhone(conn, phone);
      let contactId;

      if (!dbContact) {
        // ➕ Insert into contacts
        contactId = await contactsModel.insertContacts(conn, phone);
      } else {
        contactId = dbContact.id;
      }

      // 2️⃣ Check user ↔ contact link
      const exists = await contactsModel.userContactExists(
        conn,
        userId,
        contactId
      );

      if (!exists) {
        // ➕ Insert link
        await contactsModel.insertUserContacts(
          conn,
          userId,
          contactId,
          displayName
        );
        await embeddingService.createProfileSnapshotForSignup(
          conn,
          userId,
          contactId,
          {
            displayName,
            phone,
            defaultLabel: null
          }
        );
      } else {
         // 🔄 Update display name
        const affected = await contactsModel.updateDisplayName(
          conn,
          userId,
          contactId,
          displayName
        );

          // Only rebuild embedding if something actually changed
        if (affected > 0) {
          await embeddingService.updateNameInProfileSnapshot(
            conn,
            userId,
            contactId,
            displayName
          );
        }
      }
    }

    await conn.commit();
    return { success: true };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};


exports.addContact = async (userId, phone, display_name) => {

  const conn = await db.getConnection();

  try {

    await conn.beginTransaction();

    // 1️⃣ check if phone exists in contacts
    let contact = await contactsModel.getContactByPhone(conn, phone);

    let contactId;

    if (!contact) {
      // 2️⃣ insert into contacts
      contactId = await contactsModel.insertContacts(conn, phone);
    } else {
      contactId = contact.id;
    }

    // 3️⃣ check if already exists for this user
    const exists = await contactsModel.userContactExists(conn, userId, contactId);

    if (exists) {
      await conn.rollback();
      return "ALREADY_EXISTS";
    }

    // 4️⃣ insert into user_contacts
    await contactsModel.insertUserContacts(conn, userId, contactId, display_name);

    await conn.commit();

    return contactId;

  } catch (err) {

    await conn.rollback();
    throw err;

  } finally {

    conn.release();

  }
};

exports.changeBlock=async(userId,contactId,newBlock)=>{
  return contactsModel.changeBlock(userId,contactId,newBlock)
}