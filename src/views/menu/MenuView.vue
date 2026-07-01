<template>
    <div>
        <input v-model="searchQuery" placeholder="搜索管理员" />
    </div>
</template>
<script setup>  
    import { ref } from "vue";
    const searchQuery = ref("");
</script>   
