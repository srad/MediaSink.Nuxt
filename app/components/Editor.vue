<template>
  <div>
    <div class="card">
      <div class="card-body">
        <div class="mb-1 row">
          <label class="text-center col-3 col-form-label">Start</label>
          <div class="col">
            <input type="text" v-model="start" disabled class="form-control form-control-sm">
          </div>
        </div>
        <div class="mb-1 row">
          <label class="text-center col-3 col-form-label">End</label>
          <div class="col">
            <input type="text" v-model="end" disabled class="form-control form-control-sm">
          </div>
        </div>

        <div class="btn-group btn-group-sm w-100">
          <button @click="markStart" class="btn btn-success">start</button>
          <button @click="markEnd" class="btn btn-dark">end</button>
          <button @click="add" class="btn btn-primary">add</button>
        </div>
      </div>
    </div>

    <ul class="list-group bg-white" style="max-height: 400px; overflow-y: scroll">
      <li v-for="time in sortedTimestamps" class="list-group list-group-flush" :key="time.id">
        <div class="btn-group btn-group-sm m-1">
          <button class="btn btn-outline-success" @click="emit('start', time.start)">
            {{ time.start }}
          </button>
          <button class="btn btn-outline-dark" @click="emit('end', time.end)">
            {{ time.end }}
          </button>
          <button class="btn btn-danger" @click="destroy(time.id)">
            x
          </button>
        </div>
      </li>
    </ul>
    <hr/>
    <button class="btn btn-primary btn-sm" @click="emit('data', timestamps.map(time => [time.start, time.end]))">
      Export
    </button>
  </div>
</template>

<script setup lang="ts">
import { watch, computed, ref } from 'vue';

// --------------------------------------------------------------------------------------
// Emits
// --------------------------------------------------------------------------------------

const emit = defineEmits<{
  (e: 'add', value: { id: number, start: number, end: number }): void
  (e: 'destroy', value: Timestamp): void
  (e: 'data', value: number[][]): void
  (e: 'start', value: number): void
  (e: 'end', value: number): void
}>();

/**
 * TODO: Check if needed
 *   model: {
 *     prop: 'timestamp',
 *     event: 'change'
 *   },
 */
//const model = defineModel({
//  prop: 'timestamp',
//  event: 'change'
//});

// --------------------------------------------------------------------------------------
// Props
// --------------------------------------------------------------------------------------

const props = defineProps<{ timestamp: number }>();

// --------------------------------------------------------------------------------------
// Declarations
// --------------------------------------------------------------------------------------

interface Timestamp {
  id: number;
  start: number;
  end: number;
}

const counter = ref(0);
const start = ref(0);
const end = ref(0);
const timestamps = ref<Timestamp[]>([]);

// --------------------------------------------------------------------------------------
// Watchers
// --------------------------------------------------------------------------------------

watch(start, (val) => {
  if (end.value <= val) {
    end.value = start.value;
  }
});

// --------------------------------------------------------------------------------------
// Computed
// --------------------------------------------------------------------------------------

const sortedTimestamps = computed(() => timestamps.value.slice().sort((a, b) => a.start - b.start))

// --------------------------------------------------------------------------------------
// Methods
// --------------------------------------------------------------------------------------

const add = () => {
  if (end.value <= start.value) {
    alert(`End time ${end.value} must be bigger than start time ${start.value}`);
  }
  if (Math.abs(end.value - start.value) < 0.1) {
    alert(`Start and end time too close ${start.value}:${end.value}`);
    return;
  }
  const data = { id: counter.value, start: start.value, end: end.value };
  timestamps.value.push(data);
  counter.value += 1;
  emit('add', data);
};

const markStart = () => start.value = props.timestamp;
const markEnd = () => end.value = props.timestamp;

const destroy = (id: number) => {
  for (let i = 0; i < timestamps.value.length; i += 1) {
    if (timestamps.value[i]!.id === id) {
      emit('destroy', timestamps.value[i]!);
      timestamps.value.splice(i, 1);
      break;
    }
  }
};
</script>

<style scoped>
</style>
