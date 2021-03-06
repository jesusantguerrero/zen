<template>
    <div class="tag-select flex justify-center items-center">
        <el-popover
            v-model="state.isOpen"
            placement="bottom-end"
            popper-class='tag-select'
            :width="240"
            :show-arrow="false"
            @hide="state.selectedTag=null"
            @after-enter="focusInput()"
        >

            <div v-if="state.selectedTag">
                <div class="flex items-center mb-5">
                    <button @click="state.selectedTag = null" class="px-2 py-1 hover:bg-gray-200 rounded-md focus:outline-none"><i class="fa fa-chevron-left"></i></button>
                    <div class="font-bold ml-2"> Edit Tag</div>
                </div>
                <div class="text-left mb-6">
                    <label for="" class="mb-2 inline-block font-bold">Tag Name</label>
                    <input
                        class="w-full h-8 rounded-md px-2 border-2 border-gray-100 focus:outline-none focus:border-gray-200" 
                        type="text" 
                        placeholder="Add or create a tag"
                        v-model.trim="state.selectedTag.name"
                        ref="input"
                    />
                </div>

                <div class="mt-2">
                     <label for="" class="mb-2 inline-block font-bold">Pick a color</label>
                     <div class="grid grid-cols-4">
                        <div v-for="colors in state.tagColors" 
                            :key="colors[0]" class="h-10 w-10 my-2 rounded-full overflow-hidden flex cursor-pointer" 
                            :class="[`border-2 border-transparent ${colors.hover}`, state.selectedTag.colors && state.selectedTag.colors[0] == colors[0] && 'border-gray-600' ]"
                            @click="state.selectedTag.colors=colors"
                        >
                            <div :class="colors[0]" class="w-1/2 h-full"></div>
                            <div :class="colors[1]" class="w-1/2 h-full"></div>
                        </div>
                     </div>
                </div>

                <div class="flex justify-end">
                    <button 
                        @click="deleteTag(state.selectedTag)"
                        class="px-5 py-2 rounded-md focus:outline-none transition-colors bg-red-400 hover:bg-red-500 text-white mr-2">
                        Delete
                    </button>
                    <button
                        @click="updateTag(state.selectedTag)" 
                        class="px-5 py-2 rounded-md focus:outline-none transition-colors bg-green-400 hover:bg-green-500 text-white "> 
                        Save 
                    </button>
                </div>
            </div>

            <div class="pt-2 pb-5 px-1 w-full" v-else>
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

                <div 
                    class="tags-container mt-2 space-y-1 max-h-48 overflow-auto w-full ic-scroller pr-2" 
                    ref="container">
                    <div v-for="(tag, index) in filteredList" 
                        :key="tag" 
                        class="px-2 py-2 cursor-pointer transition-colors capitalize flex rounded-md fnnt-bold"
                        :class="[
                            `select-item-${index}`,
                            preSelectedValue == tag && 'bg-gray-500 text-white', 
                            isSelected(tag.uid) ? 'bg-gray-200 hover:bg-gray-200 ' : 'hover:bg-gray-200'
                        ]"
                        @click.stop="selectTag(tag)"
                    >
                        <div class="w-2 h-5" :class="tag.colors && tag.colors[1]">
                        </div>

                        <div class="w-full h-full ml-2">
                            {{ tag.name }}
                        </div>

                        <div @click.prevent.stop="state.selectedTag=tag" class="px-2 py-1 transition-colors rounded-full flex items-center justify-center hover:bg-gray-700 hover:text-white w-10">
                            <i class="fa fa-edit"></i>
                        </div>
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
                        
                        class="mr-1 text-white bg-gray-500 pl-2 rounded-md flex items-center"
                        :class="tag.colors"
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
import { useCollection } from "../../utils/useCollection"
import { ElMessageBox, ElNotification } from "element-plus";

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
const setSelectedTags = () => {
 selectedTags.value = props.modelValue.map(item => {
    const tag = props.tags.find(tag => tag.uid == item.uid);
        if (!item.colors || (tag && tag.colors && tag.colors[0] != item.colors[0]) ) {
            item.colors = tag ? tag.colors || [] : []
        }
        return item;
    })
}
watch(() => [...props.modelValue], () => {
   setSelectedTags()
}, { immediate: true });

watch(() => props.tags, () => {
    setSelectedTags()
});


const input = ref(null);
const button = ref(null);

const emit = defineEmit({
    'update:modelValue': Array,
    'added': Object,
    'selected': Object
})

const state = reactive({
    cursor: -1,
    isOpen: false,
    selectedTag: null,
    tagColors: [
        ['bg-green-200', 'bg-green-400', 'hover:border-green-600'],
        ['bg-blue-200', 'bg-blue-400', 'hover:border-blue-600'],
        ['bg-red-200', 'bg-red-400', 'hover:border-red-600'],
        ['bg-yellow-200', 'bg-yellow-400', 'hover:border-yellow-600'],
        ['bg-purple-200', 'bg-purple-400', 'hover:border-purple-600'],
        ['bg-pink-200', 'bg-pink-400', 'hover:border-pink-600'],
        ['bg-indigo-200', 'bg-indigo-400', 'hover:border-indigo-600'],
        ['bg-gray-200', 'bg-gray-400', 'hover:border-gray-600'],
    ]
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
const checkScroll = () => {
    if (state.cursor > -1) {
        container.value.querySelector(`.select-item-${state.cursor}`).scrollIntoView({ behavior: 'smooth' })
    }
}

const moveCursorUp = () => {
    if (state.cursor > -1 ) {
        state.cursor = state.cursor - 1
        checkScroll()
    }
}

const moveCursorDown = () => {
    if ((state.cursor + 1) < filteredList.value.length  ) {
        state.cursor = state.cursor + 1
        checkScroll()
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

const { update: updateTags, destroy: deleteTags } = useCollection();
const updateTag = (tag) => {
    if (tag.uid) {
        updateTags('tags', tag).then(() => {
            ElNotification({
                message: "Tag updated",
                type: "success"
            });
            state.selectedTag = null;
        });
    }
}

const deleteTag = async (tag) => {
    const canDelete = await ElMessageBox.confirm(`Are you sure you want to delete the tag: "${tag.name}"?<br> This tag won't be deleted from already saved tasks`, "Delete Tag", {
        dangerouslyUseHTMLString: true,
    })

    if (tag.uid && canDelete) {
        deleteTags('tags', tag).then(() => {
               ElNotification({
                message: "Tag deleted",
                type: "success"
            });
            state.selectedTag = null;
        });
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