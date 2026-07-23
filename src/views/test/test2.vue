<template>
    <div>
        <button id="btn" class="h-12 px-4 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors">读取剪切板内容</button>
    </div>
</template>

<script setup>
import { onMounted } from 'vue';
async function getCopiedText() {
    try {
        const text = await navigator.clipboard.readText();
        console.log('剪贴板内容:', text);
        return text;
    } catch (err) {
        console.error('读取失败:', err);
        // 用户拒绝权限或不在HTTPS环境下会报错
    }
}
onMounted(() => {
    document.getElementById('btn').addEventListener('click', getCopiedText);
});


</script>

<style scoped>
</style>