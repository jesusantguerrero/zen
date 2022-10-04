<template>
   <div class="flex items-center space-x-1">
      <el-avatar :title="person.name" v-for="person in  shared" :key="person.uid" :size="24" :src="person.photoUrl"
         class="text-xs transition-colors cursor-pointer hover:bg-gray-500" 
         :class="{ 'bg-green-500 border border-green-500': isSelected(person)}"
         @click="emitSelected(person)"> 
         {{ person.name.slice(0, 1) }} 
      </el-avatar>
   </div>
</template>

<script setup>
    import { inject } from "vue" 
    const props = defineProps({
      selected: {
         type: [Object, null],
         default: null
      }
    })   
    const emit = defineEmits(['update:selected']);
    
    const shared = inject("shared", []);

    const isSelected = (person) => {
      return props.selected && person.uid === props.selected.uid;
    }    
    const emitSelected = (person) => {
       emit("update:selected", isSelected(person) ? null : person);
    }
</script>