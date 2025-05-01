<script setup>
import { computed } from 'vue';
import { formatDistanceToNow } from 'date-fns';
import { useTheme } from 'vuetify';

const props = defineProps({
  items: { type: Array, required: true },
  icon: { type: String, required: true },
  emptyIcon: { type: String, required: true },
  emptyText: { type: String, required: true },
  highlightPast: { type: Boolean, default: false },
  showRelative: { type: Boolean, default: true },
  editable: { type: Boolean, default: false },
});

const emit = defineEmits(['edit', 'delete']);

const theme = useTheme();
const isDark = computed(() => theme.global.name.value === 'dark');

function formatDateParts(d) {
  const date = new Date(d);
  const absolute = date.toLocaleString();
  const relative = formatDistanceToNow(date, { addSuffix: true });
  return { absolute, relative };
}
</script>

<template>
  <v-list>
    <v-list-item
      v-for="r in props.items"
      :key="r._id"
      :class="[
        'rounded-lg mb-2 px-4 py-2',
        props.highlightPast && new Date(r.datetime) <= Date.now() ? 'bg-red-darken-1' : '',
      ]"
    >
      <template #prepend>
        <v-avatar :color="props.highlightPast ? 'red-darken-1' : 'primary'" size="26">
          <v-icon size="18" :icon="props.icon" />
        </v-avatar>
      </template>

      <v-row center no-gutters class="w-100">
        <v-col>
          <v-list-item-title class="ellipsis">{{ r.title }}</v-list-item-title>
          <v-list-item-subtitle class="reminder-subtitle">
            {{ formatDateParts(r.datetime).absolute }}
            <span v-if="props.showRelative" class="text-caption font-italic">
              {{ formatDateParts(r.datetime).relative }}
            </span>
          </v-list-item-subtitle>
        </v-col>

        <v-col v-if="props.editable" class="d-flex justify-end" cols="auto">
          <v-menu location="bottom end">
            <template #activator="{ props: menuProps }">
              <v-btn icon v-bind="menuProps">
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="$emit('edit', r)">
                <v-list-item-title>Edit</v-list-item-title>
              </v-list-item>
              <v-list-item @click="$emit('delete', r)">
                <v-list-item-title>Delete</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-col>
      </v-row>
    </v-list-item>

    <v-list-item v-if="props.items.length === 0" class="text-grey font-italic">
      <v-icon class="mr-2">{{ props.emptyIcon }}</v-icon>
      {{ props.emptyText }}
    </v-list-item>
  </v-list>
</template>

<style scoped>
.ellipsis {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.reminder-subtitle {
  display: flex;
  align-items: baseline;
  gap: 0.5ch;
}
</style>
