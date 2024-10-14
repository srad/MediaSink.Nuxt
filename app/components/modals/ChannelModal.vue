<template>
  <modal :show="showModal" @close="() => {showModal = false; emit('close'); }">
    <template v-slot:header>
      <div class="d-flex justify-content-between">
        <h5 class="modal-title">{{ myTitle }}</h5>
      </div>
    </template>
    <template v-slot:body>
      <form :class="{saving: 'disabled'}">
        <Alert :alert-type="AlertType.Error" v-if="validations.length > 0">
          <CheckList :items="validations"/>
        </Alert>

        <div>
          <label :for="`${id}_url`" class="form-label fw-bold">URL</label>
          <div class="input-group mb-3">
            <input :id="`${id}_url`" type="url" required autocomplete="off" ref="url" class="form-control" :name="`${id}_url`" v-model="myUrl" @input="recommendChannelName">
            <button class="btn btn-outline-secondary" type="button" name="button-addon1" @click="paste">
              Paste
            </button>
          </div>
        </div>

        <div class="mb-3">
          <label :for="`${id}_display`" class="form-label fw-bold">Display name</label>
          <input :id="`${id}_display`" pattern="^[^\s\\]+(\s{1}[^\s\\]+)*$" type="text" required autocapitalize="off" autocomplete="off" class="form-control" :name="`${id}_display`" v-model="myDisplayName">
          <div class="fs-6 my-2">Displayed as stream name. Can be changed at any time. No leading and trailing white
            spaces allowed, or double white spaces.
          </div>
        </div>

        <div class="mb-3">
          <label :for="`${id}_channel`" class="form-label fw-bold">Channel name</label>
          <input :id="`${id}_channel`" pattern="^[_a-z0-9]+$" type="text" required autocapitalize="off" autocomplete="off" class="form-control" :name="`${id}_channel`" :disabled="channelDisabled" v-model="myChannelName">
          <div v-if="!channelDisabled" class="fs-6 my-2">
            Only letters <span class="badge bg-info">a-z</span>, numbers <span class="badge bg-info">a-z</span>, and
            underscores <span class="badge bg-info">_</span> is allowed as channel name.
            This will also be the parent folder name for all recordings of this service.
          </div>
          <div v-else class="fs-6 my-2">
            This field is the file system folder name and cannot be changed.
          </div>
        </div>

        <div class="mb-3">
          <label :for="`${id}_minDuration`" class="form-label fw-bold">Minimum recording duration (minutes)</label>
          <input :id="`${id}_minDuration`" type="number" required min="0" class="form-control" :name="`${id}_minDuration`" v-model="myMinDuration">
          <div class="fs-6 my-2">
            Under this duration (min) a recording is discarded (considered too short)
          </div>
        </div>

        <div class="mb-3">
          <label :for="`${id}_skip`" class="form-label fw-bold">Skip start (seconds)</label>
          <input :id="`${id}_skip`" type="number" required min="0" class="form-control" :name="`${id}_skip`" v-model="mySkipStart">
          <div class="fs-6 my-2">
            Some broadcasters have certain number of seconds ads at the video start.
            Define how many seconds at start should be skipped when recording, i.e. for Twitch 15s.
          </div>
        </div>

        <div class="mb-3">
          <div class="form-check form-switch">
            <input :id="`${id}_isPaused`" type="checkbox" :checked="myIsPaused" class="form-check-input" :name="`${id}_isPaused`" v-model="myIsPaused">
            <label class="form-check-label" :for="`${id}_isPaused`">Pause Recording</label>
          </div>
          <div class="fs-6 my-2">
            Do not record as long as paused.
          </div>
        </div>
      </form>
    </template>

    <template v-slot:footer>
      <button class="btn btn-primary" @click="save" :disabled="saving">
        <span class="spinner-border spinner-border-sm text-light" role="status" v-show="saving">
          <span class="visually-hidden">Loading...</span>
        </span>
        Save
      </button>
    </template>
  </modal>
</template>

<script setup lang="ts">
import Modal from './Modal.vue';
import { ref, watch } from '#imports';
import { randomString } from '~/utils/math';
import Alert from "~/components/Alert.vue";
import { AlertType } from "~~/app/types";
import { createValidator } from "~/utils/validator";

// --------------------------------------------------------------------------------------
// Props
// --------------------------------------------------------------------------------------

const props = defineProps<{
  channelDisabled?: boolean
  clear: boolean
  isPaused: boolean
  show: boolean
  saving: boolean;
  channelId?: number
  channelName?: string
  displayName?: string
  url?: string
  skipStart?: number
  minDuration?: number
  title: string
}>();

// --------------------------------------------------------------------------------------
// Declarations
// --------------------------------------------------------------------------------------

const id = randomString();
const channelParser = /^[a-z_0-9]+$/i;

const myIsPaused = ref(props.isPaused);
const myTitle = ref(props.title);
const myUrl = ref(props.url || '');
const myDisplayName = ref(props.displayName || '');
const myChannelName = ref(props.channelName || '');
const mySkipStart = ref(props.skipStart || 0);
const myMinDuration = ref(props.minDuration || 0);
const saving = ref(false);

const validatorChannelName = 'channelName';
const validatorChannelDisplayName = 'channelDisplayName';
const validatorChannelUrl = 'channelUrl';

const validator = createValidator([
  {
    name: validatorChannelName,
    pattern: /^[_a-z0-9]+$/i,
    validMessage: 'Channel name valid',
    invalidMessage: 'Channel name invalid'
  },
  {
    name: validatorChannelDisplayName,
    pattern: /^[^\s\\]+(\s[^\s\\]+)*$/i,
    validMessage: 'Channel display name valid',
    invalidMessage: 'Channel display name invalid'
  },
  {
    name: validatorChannelUrl,
    pattern: /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi,
    validMessage: 'URL valid',
    invalidMessage: 'URL invalid'
  }
]);

const url = ref<HTMLInputElement | null>(null);
const showModal = ref(false);

const validations = ref<{ message: string, checked: boolean }[]>([]);

// --------------------------------------------------------------------------------------
// Emits
// --------------------------------------------------------------------------------------

export interface ChannelUpdate {
  isPaused: boolean,
  channelId: number,
  channelName: string,
  url: string,
  displayName: string,
  skipStart: number
  minDuration: number
}

const emit = defineEmits<{
  (e: 'save', value: ChannelUpdate): void
  (e: 'close'): void
}>();

// --------------------------------------------------------------------------------------
// Watchers
// --------------------------------------------------------------------------------------

watch(() => props.clear, (val) => {
  if (val) {
    validations.value = [];
    myChannelName.value = '';
    myUrl.value = '';
    myDisplayName.value = '';
    mySkipStart.value = 0;
    myMinDuration.value = 20;
  }
});

watch(() => props.show, (val) => {
  if (val) {
    saving.value = false;
    url.value?.focus();
  }
  showModal.value = val;
});

// Listen for form changes.
// Reason for all this: This is an optimisation to only have one modal instance.
watch(() => props.title, _ => myTitle.value = props.title);
watch(() => props.isPaused, _ => myIsPaused.value = props.isPaused);
watch(() => props.url, _ => myUrl.value = props.url || '');
watch(() => props.displayName, _ => myDisplayName.value = props.displayName || '');
watch(() => props.channelName, _ => myChannelName.value = props.channelName || '');
watch(() => props.skipStart, _ => mySkipStart.value = props.skipStart || 0);
watch(() => props.minDuration, _ => myMinDuration.value = props.minDuration || 0);

watch(() => props.saving, (val: boolean) => saving.value = val);

// --------------------------------------------------------------------------------------
// Methods
// --------------------------------------------------------------------------------------

const paste = async () => {
  myUrl.value = await navigator.clipboard.readText();
  recommendChannelName();
};

const recommendChannelName = () => {
  if (props.channelDisabled) {
    return;
  }

  const find = myUrl.value.toLowerCase()
      .split('/')
      .find(s => channelParser.test(s));

  if (find) {
    if (myChannelName.value === '') {
      myChannelName.value = find;
    }
    if (myDisplayName.value === '') {
      myDisplayName.value = find;
    }
  }
};

const validate = (message: string, isValid: boolean) => {
  if (!isValid) {
    validations.value.push({ message, checked: isValid });
  }
};

const formValid = (): { validations: ValidationMessage[], isValid: boolean } => {
  validations.value = [];

  const results = validator.validateAll([
    { name: validatorChannelName, value: myChannelName.value },
    { name: validatorChannelDisplayName, value: myDisplayName.value },
    { name: validatorChannelUrl, value: myUrl.value },
  ]);

  results.forEach(result => validate(result.message, result.isValid));

  const isValid = results.reduce((previousValue, currentValue) => previousValue && currentValue.isValid, true);

  return {
    validations: results,
    isValid
  };
};

const save = () => {
  const validationResult = formValid();
  if (validationResult.isValid) {
    emit('save', {
      isPaused: myIsPaused.value,
      channelId: props.channelId!,
      channelName: myChannelName.value,
      url: myUrl.value,
      displayName: myDisplayName.value,
      skipStart: mySkipStart.value,
      minDuration: myMinDuration.value
    });
  }
};
</script>

<style scoped>
</style>
