import Fuse from "fuse.js"
import { computed, ref} from "vue";

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
        if (!list.value) return [];
        const fuse = new Fuse([...list.value], options);
        const result = search.value && list.value.length ? fuse.search(search.value).map(item => item.item) : list.value;
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
