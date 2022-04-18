export const getNextIndex = (list) => {
  const index = Math.max(...list.map((item) => Number(item.order || 0))) + 1;
  return index < 0 ? 0 : index;
}

export const handleSnapshot = (notesRef, callback) => {
    const unsubscribe = notesRef.onSnapshot((snap) => {
      const list = [];
      snap.forEach((doc) => {
        list.push({ ...doc.data(), uid: doc.id });
      });
      callback && callback(list);
    });

    return unsubscribe;
}