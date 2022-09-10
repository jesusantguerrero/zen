<template>
<el-dropdown trigger="click" @command="$emit('command', $event)" :disabled="disabled" @click.stop="">
    <slot>
        <div class="px-2 py-1 text-sm text-gray-400 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 dark:hover:text-gray-50 focus:outline-none hover:text-gray-600" :title="isDisabled? 'Can updates tasks when timer is running' : ''" @click.stop="">
              <i class="fa fa-ellipsis-v"></i>
        </div>
    </slot>    
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item v-for="(option, optionName) in options" 
                :key="optionName" :command="optionName" :icon="option.icon">
                {{ option.label }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
</el-dropdown>
</template>

<script setup>
    defineProps({
        options: {
            type: Object,
            required: true
        }
    })
</script>