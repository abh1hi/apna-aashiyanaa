const { db, docWithId, docsWithIds } = require('../config/firestore');

class Chat {
  /**
   * Create a new chat message
   */
  static async create(chatData) {
    try {
      const docRef = await this.collection.add({
        ...chatData,
        createdAt: new Date(),
      });
      const doc = await docRef.get();
      return docWithId(doc);
    } catch (error) {
      console.error('Error creating chat message:', error);
      throw error;
    }
  }

  /**
   * Find chat messages between two users
   */
  static async findMessagesBetweenUsers(user1Id, user2Id) {
    try {
      const snapshot = await this.collection
        .where('senderId', 'in', [user1Id, user2Id])
        .where('receiverId', 'in', [user1Id, user2Id])
        .orderBy('createdAt', 'asc')
        .get();
      return docsWithIds(snapshot);
    } catch (error) {
      console.error('Error finding chat messages:', error);
      throw error;
    }
  }

  /**
   * Find chat messages by ID
   */
  static async findById(chatId) {
    try {
      const doc = await this.collection.doc(chatId).get();
      return docWithId(doc);
    } catch (error) {
      console.error('Error finding chat message by ID:', error);
      throw error;
    }
  }

  /**
   * Delete a chat message
   */
  static async delete(chatId) {
    try {
      await this.collection.doc(chatId).delete();
      return true;
    } catch (error) {
      console.error('Error deleting chat message:', error);
      throw error;
    }
  }
}

Chat.collection = db.collection('chats');

module.exports = Chat;
