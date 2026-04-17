import Fuse from "fuse.js"
import { computed, ref } from "vue";

export function useFuseSearch(searchRef, listRef, tagsRef, keys = [], stagesRef) {
    const search = searchRef || ref(null)
    const list = listRef || ref([])
    const tags = tagsRef || ref([])
    const stages = stagesRef || ref([])
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

    const getFilteredResults = () => {
      const listValue = list.value;
      if (!listValue) return [];
      const fuse = new Fuse([...listValue], options);
      const result = search.value && listValue.length ? fuse.search(search.value).map(item => item.item) : listValue;
      const searchResult = result.sort((first, second) => {
        first.order > second.order ? 1 : -1;
      })

      const tagFiltered = tags.value && tags.value.length ? searchResult.filter(item => {
         return item.tags && intersection(item.tags.map(tag => tag.uid),  tags.value)
      }) : searchResult;

      return stages.value && stages.value.length
        ? tagFiltered.filter(item => item.stage && stages.value.includes(item.stage))
        : tagFiltered;
    }

    const filteredList = computed(() => {
      return getFilteredResults()
    })

    return {
      searchRef,
      tagsRef,
      stagesRef,
      filteredList,
    }
}

export const useSearchOptions = (tagId = 'uid') => {
  const searchText = ref("");
  const searchTags = ref([]);
  const searchStages = ref([]);
  const selectedTags = computed(() => {
    return searchTags.value.map(tag => tag[tagId])
  })

  return {
    selectedTags,
    searchText,
    searchTags,
    searchStages,
  }

}
