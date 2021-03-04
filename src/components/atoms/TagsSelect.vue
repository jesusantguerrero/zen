<template>
    <div class="tag-select flex justify-center items-center">
        <el-popover
            v-model="state.isOpen"
            placement="bottom-end"
            popper-class='tag-select'
            :width="240"
            :show-arrow="false"
            @after-enter="focusInput()"
        >

            <div class="pt-2 pb-5 px-1 w-full">
                <input
                    class="w-full h-8 rounded-md px-2 border-2 border-gray-100 focus:outline-none focus:border-gray-200" 
                    type="text" 
                    placeholder="Add or create a tag"
                    v-model.trim="searchText"
                    ref="input"
                    @click.stop
                    @input="gotoTop"
                    @keydown.enter="selectTag()"
                    @keydown.up.prevent="moveCursorUp()"
                    @keydown.down.prevent="moveCursorDown()"
                />

                <div class="tags-container mt-2 space-y-1 max-h-48 overflow-auto w-full ic-scroller" ref="container">
                    <div v-for="tag in filteredList" 
                        :key="tag" 
                        class="px-2 py-2 cursor-pointer rounded-sm transition-colors"
                        :class="[
                            preSelectedValue == tag && 'bg-gray-500 text-white', 
                            isSelected(tag.uid) ? 'bg-gray-200 hover:bg-gray-500 hover:text-white' : 'hover:bg-gray-500 hover:text-white'
                        ]"
                        @click.stop="selectTag(tag)"
                    >
                        {{ tag.name }}
                    </div>
                </div>

                <div v-if="searchText && filteredList.length == 0 && allowAdd">
                    <button class="px-2 h-8 w-full" @click="addTag"> 
                        Add tag:  "{{ searchText}}"</button>
                </div>
                <div v-else-if="filteredList.length == 0 && searchText" class="text-center">
                    <span> This tag doesn't exists</span>
                </div>
            </div>


            <template #reference>
            <button 
                ref="button"
                :class="{'text-gray-500': true }" 
                class="flex focus:outline-none space-x-1 items-center text-xs h-full"
                @mousedown.prevent
                @focus.prevent="focusButton"
            >
                <i class="fa fa-tags cursor-pointer"></i>
                    <span v-if="!selectedTags.length"> {{ placeholder }} </span>
                    <span 
                        v-for="tag in selectedTags.slice(0, limit)" 
                        :key="tag.name" 
                        
                        class="mr-1 text-white bg-gray-500 pl-2 rounded-md"
                    > 
                        {{ tag.name}}

                        <button  @click.prevent.stop="select(tag)" class="hover:bg-gray-700 transition-colors rounded-r-md py-1">
                            <i class="fa fa-times px-2"></i>
                        </button>
                    </span>
                    <span 
                        v-if="moreTags"
                        :title="moreTags"
                        class="mr-1 text-white bg-gray-500 px-2 py-1 rounded-md"> 
                        + {{ selectedTags.slice(limit).length }}
                    </span>

            </button>
            </template>
        </el-popover>
    </div>
</template>

<script setup>
import { computed, defineEmit, reactive, watch, ref, toRefs } from "vue";
import { useFuseSearch } from "../../utils/useFuseSearch"

const props = defineProps({
    tags: {
        type: Array,
        default() {
            return []
        }
    },
    modelValue: {
        type: Array,
        default() {
            return
        }
    },
    limit: {
        type: Number,
        default: 2
    },
    multiple: Boolean,
    placeholder:{
        type: String,
        default: 'Add tags'
    },
    allowAdd: {
        type: Boolean,
        default: true
    }
})
const selectedTags = ref([])
watch(() => [...props.modelValue], (value) => {
    selectedTags.value = value
}, { immediate: true })
const input = ref(null);
const button = ref(null);

const emit = defineEmit({
    'update:modelValue': Array,
    'added': Object,
    'selected': Object
})

const state = reactive({
    cursor: 0,
    isOpen: false,
})

// Tags
const searchText = ref("")
const { tags, allowAdd } = toRefs(props)

const formattedTags = computed(() => {
    return selectedTags && selectedTags.value.map(item => item.name).join(" ")
});

const moreTags = computed(() => {
    return selectedTags && selectedTags.value.slice(props.limit).map(item => item.name).join(" ")
});

const { filteredList  } = useFuseSearch(searchText, tags,null,  ['name'])

const isSelected = (uid) => {
    return selectedTags.value.find( tag => tag.uid == uid)
}

// Cursor
const focusInput = () => {
    input.value && input.value.focus()
}

const focusButton = (e) => {
    e.target.click()
}

watch(() => filteredList.value, (tags) => {
    if (state.cursor > filteredList.value.length - 1) {
        state.cursor = 0;
    }
})

const preSelectedValue = computed(() => {
    return state.cursor <= filteredList.value.length ? filteredList.value[state.cursor] : "";
});

const container = ref(null);
const gotoTop = () => {
    container.value.scrollTop=0
}

const moveCursorUp = () => {
    if (state.cursor > 0 ) {
        state.cursor = state.cursor - 1
    }
}

const moveCursorDown = () => {
    if ((state.cursor + 1) < filteredList.value.length  ) {
        state.cursor = state.cursor + 1
    }
}

// emits
const addTag = () => {
    if (searchText.value) {
        emit('added', {
            name: searchText.value
        });
        searchText.value = "";
    }
}

const selectTag = (tag) => {
    if (filteredList.value.length) {
        const selected = tag || filteredList.value[state.cursor]
        select(selected)
    } else {
        addTag()
    }
}

const select = (tag) => {
  const index = selectedTags.value.findIndex(item => tag.uid == item.uid)
  if (index < 0 && props.multiple) {
    selectedTags.value.push(tag)
  } else if (index < 0 && !props.multiple) {
    selectedTags.value = [tag]
  } else {
    selectedTags.value.splice(index, 1);
  }

  if (props.multiple) {
      input.value.focus()
  } else {
      state.isOpen = false;
  }

  emit('update:modelValue', selectedTags.value)
}

</script>