<template >
    <div class="modal-loading">
        <svg class="animated-svg" xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 180 180" fill="none">
            <path class="path1" d="M175.413 5.77282C137.143 -11.1967 97.4548 21.6818 82.3947 40.2422C194.017 32.2878 87.71 146.302 77.0793 159.559C108.971 164.862 132.536 159.559 138.206 154.256C153.984 139.5 223.251 26.9848 175.413 5.77282Z" fill="#5565FF"/>
            <path class="path2" d="M21.2683 40.2422C39.9477 5.77283 83.2806 -2.18168 108.971 0.469761C98.3409 8.42448 74.7531 17.1677 55.8178 66.7568C34.5562 122.438 66.4484 117.135 98.3405 119.787C87.7096 146.302 46.2624 166.74 21.2683 159.559C-19.7326 147.78 8.9932 60.8754 21.2683 40.2422Z" fill="#5565FF"/>
            <circle cx="89.1035" cy="79.8101" r="18.8203" fill="#5565FF"/>
        </svg>
    </div>
</template>
<script>
export default {
    name:"loadderPage"
}
</script>
<style >
.modal-loading{
    position: absolute;
    top: 0;
    right:0;
    backdrop-filter: blur(10px);
    width: 99%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 10px;
}
svg {
    overflow: visible;
}

.path1, .path2 {
    transform-origin: 50% 45%;
    animation: swapPaths 2s infinite;
}

@keyframes swapPaths {
    0% {
        transform: rotate(0deg);
    }
    50% {
        transform: rotate(180deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
</style>