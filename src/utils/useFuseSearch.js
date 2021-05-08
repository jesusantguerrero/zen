import Fuse from "fuse.js"
import { computed, isRef, ref, toRef} from "vue";

export function useFuseSearch(searchRef, listRef, tagsRef, keys = []) {
    const search = searchRef || ref(null)
    const list = listRef || ref([])
    const tags = tagsRef || ref([])
    const options = {
        threshold: 0.2,
        keys: [
          "title",
          ...keys
        ]
      };

      const intersection = (list1, list2) => {
        return list1.filter(value => list2.includes(value)).length
      }  
      
      const filteredList = computed(() => {
        const listValue = list.value;
        if (!listValue) return [];
        const fuse = new Fuse([...listValue], options);
        const result = search.value && listValue.length ? fuse.search(search.value).map(item => item.item) : listValue;
        const searchResult = result.sort((fist, second) => {
          fist.order > second.order ? 1 : -1;
        })
        return tags.value.length ? searchResult.filter(item => {
           return item.tags && intersection(item.tags.map(tag => tag.uid),  tags.value)
        }) : searchResult;
      
    })
    return {
        filteredList: filteredList,
    }
}
