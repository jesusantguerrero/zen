import { Ref } from "vue"

export const useSnapshot = (
  snapshot: Promise<firebase.default.firestore.Query>,
  valueHolder: Ref, 
  { validator, after, parser } = {} ) => {
    return snapshot.then(fbQuery => {
      return fbQuery.onSnapshot( snap => {
        const list: unknown[] = []
        snap.forEach(doc => {
          const docData = doc.data()
          if (validator && validator(docData) || !validator) {
            list.push({ ...docData, uid: doc.id })
          }
        })
        valueHolder.value = parser ? parser(list) : list
        after && after(list);
      })
  })
}