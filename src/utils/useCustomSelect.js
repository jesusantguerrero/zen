import { inject, nextTick, provide, ref, watch } from "vue";
import { useCollection } from "./useCollection"

const { save, getAll } = useCollection()

export function useCustomSelect(entity, resourceName) {
    const list = inject(resourceName, [])    
    const itemsRef = ref(null)
    const items = ref(null)

    const selectItem = (item) => {
      if (item) {
        entity[resourceName].push(item)
      }
    }
    
    
    const getInitialItems = () => {
      itemsRef.value = getAll(resourceName).onSnapshot(snap => {
        items.value = [];
        snap.forEach((doc) => {
            const tag = {...doc.data(), uid: doc.id } 
            items.value.push(tag);
        })
      })
    }

    const addToList = (item) => {
      save(resourceName, item).then((itemUid) => {
         return selectItem({ ...item, uid: itemUid })
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
