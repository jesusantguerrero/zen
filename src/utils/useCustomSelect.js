import { inject, provide, ref } from "vue";
import { useCollection } from "./useCollection"
const { save, getAll } = useCollection()

export function useCustomSelect(selectedItems, resourceName) {
    const list = inject(resourceName, [])
    
    const addToList = (item) => {
      save(resourceName, item).then((itemUid) => {
        const createdTag = selectedItems.find(localItem => localItem.uid == itemUid)
        return selectItem(createdTag)
      })
    }

    const selectItem = (item) => {
      selectedItems.push(item)
    }
    
    const itemsRef = ref(null)
    const items = ref(null)
    const getInitialItems = () => {
      itemsRef.value = getAll(resourceName).onSnapshot(snap => {
        items.value = [];
        snap.forEach((doc) => {
            items.value.push({...doc.data(), uid: doc.id });
        })
      })
    }
    provide(resourceName, items);
  
    return {
        list,
        itemsRef,
        items,
        addToList,
        selectItem,
        getInitialItems
    }
}
