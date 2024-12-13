<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Vue3Lottie } from 'vue3-lottie'
import type { Ref } from 'vue'

// Импортируем JSON анимации
import tabStoreAnimation from '@/shared/lottie-animations/tab-store.json'
import tabGiftsAnimation from '@/shared/lottie-animations/tab-gifts.json'
import tabLeaderboardAnimation from '@/shared/lottie-animations/tab-leaderboard.json'
import tabProfileAnimation from '@/shared/lottie-animations/tab-profile.json'

const route = useRoute()
const router = useRouter()

const currentRoute = computed(() => route.name)

interface LottieRef {
  play: () => void;
  pause: () => void;
  stop: () => void;
  destroy: () => void;
  goToAndStop: (value: number, isFrame?: boolean) => void;
  goToAndPlay: (value: number, isFrame?: boolean) => void;
  setSpeed: (speed: number) => void;
  setDirection: (direction: 'forward' | 'reverse') => void;
  playSegments: (segments: [number, number] | [number, number][], forceFlag?: boolean) => void;
  getDuration: (inFrames?: boolean) => number;
}

// Создаем типизированный Record для анимаций
type AnimationRefs = Record<string, Ref<LottieRef | null>>;

const animationInstances: AnimationRefs = {
  store: ref(null),
  gifts: ref(null),
  leaderboard: ref(null),
  profile: ref(null)
}

// Конфигурация для каждого пункта меню
const menuItems = [
  { 
    name: 'store', 
    animation: tabStoreAnimation, 
    label: 'Store',
  },
  { 
    name: 'gifts', 
    animation: tabGiftsAnimation, 
    label: 'Gifts',
  },
  { 
    name: 'leaderboard', 
    animation: tabLeaderboardAnimation, 
    label: 'Leaderboard',
  },
  { 
    name: 'profile', 
    animation: tabProfileAnimation, 
    label: 'Profile',
  }
]

// Добавляем флаг для отслеживания первичной загрузки
const isFirstLoad = ref(true)

// Добавляем ref для отслеживания текущего кадра анимации
const currentFrame = ref<Record<string, number>>({
  store: 0,
  gifts: 0,
  leaderboard: 0,
  profile: 0
})

// Добавляем функцию для обработки ref анимации
const handleAnimationRef = (el: any, name: string) => {
  if (el) {
    animationInstances[name].value = el
  }
}

// Управление видимостью через комбинацию метаданных маршрута и событий
const isVisible = ref(true)

// Проверяем видимость на основе метаданных маршрута и состояния
const shouldShowNavigation = computed(() => {
  // Если в маршруте указано явно скрыть навигацию
  if (route.meta.hideNavigation) {
    return false
  }
  // Иначе используем локальное состояние
  return isVisible.value
})

// Обработчик события видимости
const handleVisibilityChange = (event: CustomEvent) => {
  isVisible.value = event.detail.visible
}

onMounted(() => {
  window.addEventListener('bottom-navigation-visibility', handleVisibilityChange as EventListener)
  
  // Принудительно останавливаем все анимации при монтировании
  requestAnimationFrame(() => {
    Object.values(animationInstances).forEach(instance => {
      instance.value?.stop()
      instance.value?.goToAndStop(0)
    })
  })
})

onUnmounted(() => {
  window.removeEventListener('bottom-navigation-visibility', handleVisibilityChange as EventListener)
})

const navigate = async (_routeName: string) => {
  try {
    if (_routeName !== currentRoute.value) {
      // Останавливаем текущую анимацию если она есть
      if (currentRoute.value && typeof currentRoute.value === 'string') {
        const currentInstance = animationInstances[currentRoute.value]?.value
        if (currentInstance) {
          currentInstance.stop()
          currentInstance.goToAndStop(0, true)
        }
      }
      
      await router.push({ name: _routeName })
      
      // Запускаем новую анимацию
      const newInstance = animationInstances[_routeName]?.value
      if (newInstance) {
        // Воспроизводим только один раз определенный сегмент
        newInstance.playSegments([0, 30], false) // false означает, что анимация не будет зациклена
      }
    }
  } catch (error) {
    console.error('Ошибка навигации:', error)
  }
}

// Настройки для Lottie анимаций
const getLottieOptions = () => ({
  width: 26,
  height: 26,
  loop: false, // Важно: должно быть false
  autoplay: false,
  segments: [0, 30], // Указываем сегмент анимации
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid meet',
    clearCanvas: true,
    progressiveLoad: true,
  }
})

// Обработчик кадра анимации
const handleEnterFrame = (e: { currentTime: number }, itemName: string) => {
  currentFrame[itemName] = e.currentTime
  const instance = animationInstances[itemName]?.value
  
  // Если достигли последнего кадра (29 - это последний кадр, так как анимация 30 кадров)
  if (e.currentTime >= 29 && instance) {
    instance.stop()
    instance.goToAndStop(29, true) // Останавливаем на последнем кадре
  }
}
</script>

<template>
  <nav 
    v-if="shouldShowNavigation"
    class="bottom-navigation fixed bottom-0 left-0 right-0 z-50 flex justify-center items-start self-stretch bg-white dark:bg-black border-t border-[#3C3C4326] dark:border-[#545458A6]"
  >
    <div class="flex justify-around w-full">
      <button
        v-for="item in menuItems"
        :key="item.name"
        class="flex flex-col items-center pt-[7px] min-w-[70px] transition-all duration-200 active:scale-95"
        :class="{
          'text-[#007AFF]': currentRoute === item.name,
          'text-[#545458A6]': currentRoute !== item.name
        }"
        @click="navigate(item.name)"
      >
        <Vue3Lottie
          :animation-data="item.animation"
          :ref="(el) => handleAnimationRef(el, item.name)"
          :options="getLottieOptions()"
          :style="{
            filter: currentRoute === item.name ? 'invert(40%) sepia(93%) saturate(1352%) hue-rotate(198deg) brightness(119%) contrast(119%)' : 'none'
          }"
          class="w-[26px] h-[26px]"
          @enter-frame="(e) => handleEnterFrame(e, item.name)"
        />
        <span 
          class="text-[10px]  font-medium tracking-[0.1px] mt-1"
        >
          {{ item.label }}
        </span>
      </button>
    </div>
  </nav>
</template>

<style scoped>

button:active {
  transform: scale(0.95);
}


button, span {
  transition: all 0.2s ease;
}
</style>
