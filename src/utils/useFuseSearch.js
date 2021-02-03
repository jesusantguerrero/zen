import Fuse from "fuse.js"
import { computed, ref} from "vue";

export function useFuseSearch(searchRef, listRef, keys = []) {
    const search = searchRef || ref(null)
    const list = listRef || ref(null)
    const options = {
        // isCaseSensitive: false,
        // includeScore: false,
        // shouldSort: true,
        // includeMatches: false,
        // findAllMatches: false,
        // minMatchCharLength: 1,
        // location: 0,
        threshold: 0.2,
        // distance: 100,
        // useExtendedSearch: false,
        // ignoreLocation: false,
        // ignoreFieldNorm: false,
        keys: [
          "title",
          ...keys
        ]
      };
      
      const filteredList = computed(() =>{
        const fuse = new Fuse([...list.value], options);
        return search.value && list.value.length ? fuse.search(search.value).map(item => item.item) : list.value;
    })

    return {
        filteredList: filteredList,
    }
}
