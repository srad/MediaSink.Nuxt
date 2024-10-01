<template>
  <!-- Disable draggable, otherwise browsers do that pseudo-dragging ghosting movement of images -->
  <div class="position-relative user-select-none" ref="stripe" style="height: 100%;" @click="seek($event)" draggable="false">
    <img draggable="false"
         alt="stripe"
         @load="load"
         class="stripe position-absolute"
         ref="stripeImage"
         :src="src"
         style="height: 100%"
         @mousedown="down($event)"/>

    <div :key="marking.start"
         @click="markingSelect(i)"
         :class="{'selected': marking.selected, 'unselected': !marking.selected}"
         class="marking position-absolute"
         draggable="false"
         v-for="(marking, i) in markings"
         :style="{left: marking.start+'px', width: (marking.end-marking.start)+'px'}">
      <span class="bar bar-start position-absolute"
            draggable="false"
            v-if="currentMarkerIndex === -1 || (currentMarkerIndex-1 === i && !mouseDown)"
            @mousedown="markerDown($event, marking, i, 'start')">
      </span>
      <span class="bar bar-end position-absolute"
            v-if="currentMarkerIndex === -1 || (currentMarkerIndex-1 === i && !mouseDown)"
            @mousedown="markerDown($event, marking, i, 'end')"
            draggable="false"></span>
      <i @click="destroyMarking(i)" v-if="currentMarkerIndex === -1 || (currentMarkerIndex-1 === i && !mouseDown)" class="text-white bg-danger p-1 bi bi-trash marking-destroy position-absolute" style="opacity: 1"></i>
    </div>

    <div v-if="showBar" class="timecode position-absolute" :style="{left: `${offset}px`}"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, useState } from '#imports';

// --------------------------------------------------------------------------------------
// Props
// --------------------------------------------------------------------------------------

const props = defineProps<{
  src: string
  timecode: number
  duration: number
  paused: boolean
  disabled: boolean
}>();

// --------------------------------------------------------------------------------------
// Emits
// --------------------------------------------------------------------------------------

const emit = defineEmits<{
  (e: 'offset', offset: number, clientX: number): void
  (e: 'seek', value: { clientX: number, width: number }): void
  (e: 'selecting'): void
  (e: 'marking', value: Marking[]): void
}>();

// --------------------------------------------------------------------------------------
// Declarations
// --------------------------------------------------------------------------------------

export interface Marking {
  selected?: boolean;
  start: number;
  end: number;
  timestart: number;
  timeend: number;
}

const markings = useState<Marking[]>('marking', () => []);
const showBar = useState('showBar', () => true);
const stripeImage = useState<HTMLImageElement | null>('stripeImage', () => null);
const stripe = useState<HTMLElement | null>('stripe', () => null);

let markerPos = '';
let markerDownIndex = 0;
let mouseOffsetX = 0;
let mouseDown = false;
let mouseMoved = false;
let currentMarkerIndex = -1;
let width = 0;
let clientX = 0;

// --------------------------------------------------------------------------------------
// Hooks
// --------------------------------------------------------------------------------------

onUnmounted(() => stripe.value?.removeEventListener('wheel', resizePreview, true));

onMounted(() => {
  stripe.value?.addEventListener('wheel', resizePreview, true);
});

// --------------------------------------------------------------------------------------
// Methods
// --------------------------------------------------------------------------------------

const offset = computed(() => {
  const offset = (props.timecode / props.duration) * width;
  emit('offset', offset, clientX);
  return offset;
});

const seek = (event: MouseEvent) => {
  if (props.disabled) {
    return;
  }
  clientX = getX(event);
  showBar.value = true;
  emit('seek', { clientX: getMouseX(event), width: width });
};

const moveMarker = (event: MouseEvent) => {
  const x = getMouseX(event);
  const i = markerDownIndex;

  if (markerPos === 'start') {
    if (x > markings.value[i].end - 50) {
      return;
    }
    markings.value[i].start = x;
    markings.value[i].timestart = markings.value[i].start / width * props.duration;
  } else {
    if (x < markings.value[i].start + 50) {
      return;
    }
    markings.value[i].end = x;
    markings.value[i].timeend = markings.value[i].end / width * props.duration;
  }
};

const markerUp = () => {
  if (!props.paused) {
    return;
  }

  markerDownIndex = 0;
  markerPos = '';
  document.body.style.cursor = 'default';
  window.removeEventListener('mousemove', moveMarker);
  window.removeEventListener('mouseup', markerUp);
  emit('marking', markings.value);
};

const markerDown = (event: MouseEvent, marker: Object, i: number, pos: string) => {
  event.preventDefault();
  event.stopPropagation();

  if (props.disabled || !props.paused) {
    return;
  }

  if (markerDownIndex !== 0) {
    return;
  }
  markerDownIndex = i;
  markerPos = pos;
  document.body.style.cursor = 'col-resize';
  window.addEventListener('mousemove', moveMarker);
  window.addEventListener('mouseup', markerUp);
};

const load = () => {
  width = stripeImage.value!.clientWidth;
};

const destroyMarking = (index: number) => {
  if (props.disabled) {
    return;
  }
  markings.value.splice(index, 1);
  emit('marking', markings.value);
};

const getMouseX = (event: MouseEvent): number => {
  const el = stripe;
  if (!el.value) {
    return 0;
  }

  const bounds = el.value.getBoundingClientRect();
  return el.value!.scrollLeft + event.clientX - bounds.left;
};

const getX = (event: MouseEvent) => {
  const bounds = stripe.value!.getBoundingClientRect();
  return event.clientX - bounds.left;
};

const down = (event: MouseEvent) => {
  event.stopPropagation();
  event.preventDefault();

  showBar.value = false;
  mouseDown = true;

  const endX = getMouseX(event);

  currentMarkerIndex = markings.value.push({
    selected: false,
    start: endX,
    end: endX,
    timestart: endX / width * props.duration,
    timeend: endX / width * props.duration
  });

  window.addEventListener('mousemove', mouseMove);
  window.addEventListener('mouseup', mouseUp);
};

const mouseMove = (event: MouseEvent) => {
  event.stopPropagation();
  event.preventDefault();

  mouseMoved = true;
  if (currentMarkerIndex !== -1) {
    emit('selecting');
    mouseOffsetX = getMouseX(event);
    markings.value[currentMarkerIndex - 1].end = mouseOffsetX;
    markings.value[currentMarkerIndex - 1].timeend = mouseOffsetX / width * props.duration;
  }
};

const mouseUp = (event: MouseEvent) => {
  event.stopPropagation();
  event.preventDefault();

  if (!mouseDown) {
    return;
  }

  mouseDown = false;

  if (!mouseMoved && currentMarkerIndex !== -1) {
    markings.value.splice(currentMarkerIndex - 1, 1);
    mouseMoved = false;
    showBar.value = true;
    currentMarkerIndex = -1;
    window.removeEventListener('mousemove', mouseMove);
    window.removeEventListener('mouseup', mouseUp);
    return;
  }
  mouseMoved = false;

  if (!props.paused) {
    return;
  }

  const marking = markings.value[currentMarkerIndex - 1];
  const durationInSeconds = marking.timeend - marking.timestart;

  if (durationInSeconds < 1) {
    destroyMarking(currentMarkerIndex - 1);
  }

  currentMarkerIndex = -1;
  window.removeEventListener('mousemove', mouseMove);
  window.removeEventListener('mouseup', mouseUp);

  // Reset
  showBar.value = true;
  mouseOffsetX = 0;
  mouseMoved = false;
  emit('marking', markings.value);
};

/**
 * Checks if a selection has an overlap.
 * Right now overlaps are allowed for creative purposes, this allows to make join repeated video segments.
 * However, in case overlaps shall be forbidden, this function can check the marking for overlaps.
 * @param selectionStart
 * @param selectionEnd
 */
const overlaps = (selectionStart: number, selectionEnd: number) => {
  // No markings yet.
  if (markings.value.length === 0 || currentMarkerIndex === markings.value.length) {
    return false;
  }

  const sorted = markings.value
      .sort((a, b) => a.start - b.start)
      .sort((a, b) => a.end - b.end);

  // Smaller than first marking.
  if (selectionStart < sorted[0].start && selectionEnd < sorted[0].end) {
    return false;
  }

  // Traverse all markings and make sure there is no overlap.
  for (let i = 0; i < sorted.length; i++) {
    const start = sorted[i].start;
    const end = sorted[i].end;

    // Multiple cases:
    // |----******----| -> start >= selectionStart && selectionEnd <= end
    // ****|****------| -> selectionStart <= start && end >= selectionStart && end <= selectionEnd
    //|-------***|****  -> selectionStart >= start && selectionStart <= end && selectionEnd >= end
    //****|*****|*****  -> selectionStart => start && selectionEnd <= end

    const overlaps = (start >= selectionStart && selectionEnd <= end) || (selectionStart <= start && end >= selectionStart && end <= selectionEnd) || (start && selectionStart <= end && selectionEnd >= end) || (selectionStart <= start && selectionEnd >= end);

    if (overlaps) {
      return true;
    }
  }
  return false;
};

const markingSelect = (index: number) => {
  // catch event order from stripe before the delete button
  if (props.disabled || !markings.value[index]) {
    return;
  }

  // Only one at a time
  markings.value.forEach(m => m.selected = false);
  markings.value[index].selected = !markings.value[index].selected;
};

const resizePreview = (event: WheelEvent) => {
  const el = stripeImage.value!;

  const resizeBy = event.deltaY * 3;
  const oldWidth = el.width;

  el.width += resizeBy;

  if (el.width < window.innerWidth * 3 / 4) {
    el.width = oldWidth;
    return;
  }

  const factor = el.width / oldWidth;
  width = el.width;

  // Linear transformation on all x coordinates
  markings.value.forEach(m => {
    m.start *= factor;
    m.end *= factor;
  });
  //emit('scroll', event);
};
</script>

<style scoped>
.marking {
  height: 100%;
  opacity: 0.5;
}

.unselected {
  background: blueviolet;
  user-select: none;
}

.selected {
  background: greenyellow;
  user-select: none;
}

.marking-destroy {
  right: 8px;
  top: 4px;
  line-height: 18px;
  border-radius: 4px;
  margin: 0;
  user-select: none;
}

.bar {
  height: 100%;
  width: 2px;
  background: red;
  opacity: 1;
  cursor: ew-resize;
  user-select: none;
}

.timecode {
  width: 3px;
  height: 100%;
  background: red;
  user-select: none;
}

img {
  user-select: none;
  image-rendering: optimizeQuality;
}

.bar-start {
  left: 0;
}

.bar-end {
  right: 0
}
</style>
