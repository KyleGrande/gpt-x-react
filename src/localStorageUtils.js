const CHATS_STORAGE_KEY = 'chats';

export const saveChats = (chats) => {
  localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(chats));
};

export const loadChats = () => {
  const storedChats = localStorage.getItem(CHATS_STORAGE_KEY);
  if (storedChats) {
    return JSON.parse(storedChats);
  }
  return [];
};
