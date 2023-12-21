<template>
  <svg viewBox="0 0 175 196" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path class="path1" d="M48 42L35 177" stroke="black" stroke-width="5" />
    <path
      class="path1"
      d="M1 31C82.1213 42.6196 115.249 63.8553 121.62 71.8688C127.991 79.8823 135.211 98.1739 43.0472 120.751C71.0786 113.133 118.222 109.132 113.551 129.165C105.941 161.796 48.5685 200.485 37.9506 174.442"
      stroke="black"
      stroke-width="5"
    />
    <path
      class="path2"
      d="M84.5 16.5L69 185.5"
      stroke="black"
      stroke-width="5"
    />
    <path
      class="path2"
      d="M26 3C121.5 17.5 160.5 44 168 54C175.5 64 184 86.826 75.5 115C108.5 105.494 164 100.5 158.5 125.5C149.542 166.22 82 214.5 69.5 182"
      stroke="black"
      stroke-width="5"
    />
  </svg>
</template>

<style scoped>
path {
  animation: none !important;
  stroke-dasharray: unset !important;
}
@keyframes grow1 {
  0% {
    stroke-dashoffset: 1px;
    stroke-dasharray: 0 500px;
  }
  20% {
    stroke-dasharray: 500px 0;
  }
  85% {
    stroke-dasharray: 500px 0;
  }
  95%,
  to {
    stroke-dasharray: 0 500px;
  }
}
@keyframes grow2 {
  0% {
    stroke-dashoffset: 1px;
    stroke-dasharray: 0 500px;
  }
  10% {
    stroke-dasharray: 0 500px;
  }
  50% {
    stroke-dasharray: 500px 0;
  }
  85% {
    stroke-dasharray: 500px 0;
  }
  95%,
  to {
    stroke-dasharray: 0 500px;
  }
}
.path1 {
  stroke-dashoffset: 1px;
  stroke-dasharray: 500px 0;
  animation: grow1 10s ease forwards infinite;
  transform-origin: center;
  stroke: #303030;
  animation-delay: 0s;
}

.path2 {
  stroke-dashoffset: 1px;
  stroke-dasharray: 500px 0;
  animation: grow2 10s ease forwards infinite;
  transform-origin: center;
  stroke: #303030;
  animation-delay: 0s;
}

.dark path {
  @apply stroke-gray-200;
}
</style>
