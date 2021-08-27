<template>
    <div class="flex items-center space-x-1">
        <el-avatar v-if="allowSpaces"  @click="isSpaceModalOpen=true" :size="24" class="text-xs transition-colors cursor-pointer hover:bg-gray-500">     
            S
        </el-avatar>
        <el-avatar  @click="isShareModalOpen=true" :size="24" class="text-xs transition-colors cursor-pointer hover:bg-gray-500">     
            <span class="text-xs"><i class="fa fa-user"></i></span>
        </el-avatar>
        
        <share-modal
            v-model:is-open="isShareModalOpen"
            @cancel="isShareModalOpen=false"
            @saved="isShareModalOpen=false"
        />
        <create-space-modal
            v-model:is-open="isSpaceModalOpen"
            @cancel="isSpaceModalOpen=false"
            @saved="isSpaceModalOpen=false"
        />
    </div>

</template>

<script setup>
    import { ref } from 'vue';
    import ShareModal from './modals/ShareModal.vue';
    import CreateSpaceModal from './modals/CreateSpaceModal.vue';
    const isShareModalOpen = ref(false);
    const isSpaceModalOpen = ref(false);
</script>