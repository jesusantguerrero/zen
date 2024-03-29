import { format } from "date-fns";

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

export const SESSION_MODES = {
  WORK: 'promodoro',
  REST: 'rest',
  LONG_REST: 'long'
}

export const formatDate = (date, formatString = "MMM dd yyyy") => {
  try {
    return format(date,  formatString)
  } catch (err) {
    return date;
  }
}

export const isSameDateTime = (firstDate, secondDate, formatString = "yyyy-MM-dd HH:mm:ss") => {
  return formatDate(firstDate, formatString) == formatDate(secondDate, formatString)
}