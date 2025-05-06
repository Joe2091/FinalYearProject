<script setup>
import { useNotes } from '@/composables/useNotes';

const {
  notes,
  newTitle,
  newContent,
  editingTitleId,
  shareEmail,
  formatDate,
  isDark,
  shareMenus,
  addNote,
  deleteNoteById,
  autoSave,
  toggleFavorite,
  summarizeNote,
  shareNote,
  isSharedNote,
  truncateTitle,
} = useNotes();
</script>

<template>
  <v-container fluid class="notes-page-container">
    <!-- Create new note -->
    <v-card class="pa-4 mb-4">
      <v-card-title>NoteMAX</v-card-title>
      <v-text-field v-model="newTitle" label="Title" dense outlined />
      <v-textarea v-model="newContent" label="Content" dense outlined />
      <v-btn color="primary" class="mt-2" @click="addNote">Add Note</v-btn>
    </v-card>

    <!-- Notes grid -->
    <v-row>
      <v-col
        v-for="note in [...notes].sort((a, b) => {
          if (b.isFavorite !== a.isFavorite) {
            return b.isFavorite - a.isFavorite;
          }
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        })"
        :key="note._id"
        cols="12"
        sm="6"
        md="4"
      >
        <v-card class="pa-2 d-flex flex-column justify-space-between" style="min-height: 180px">
          <div class="title-wrapper" @click="editingTitleId = note._id">
            <template v-if="editingTitleId === note._id">
              <v-text-field
                v-model="note.title"
                variant="plain"
                autofocus
                dense
                hide-details
                class="mb-2"
                @blur="
                  () => {
                    autoSave(note);
                    editingTitleId = null;
                  }
                "
              />
            </template>
            <template v-else>
              <div class="truncated-title d-flex align-center">
                <!-- Title tooltip -->
                <v-tooltip location="top">
                  <template #activator="{ props }">
                    <div v-bind="props">
                      {{ truncateTitle(note.title) }}
                    </div>
                  </template>
                  <span>{{ note.title }}</span>
                </v-tooltip>

                <!-- Shared users tooltip -->
                <v-tooltip location="top" v-if="isSharedNote(note) || note.sharedWith?.length">
                  <template #activator="{ props }">
                    <v-icon v-bind="props" color="primary" size="small" class="ml-1" style="cursor: default">
                      mdi-account-multiple
                    </v-icon>
                  </template>
                  <span>
                    {{ isSharedNote(note) ? 'Shared with you' : `Shared with ${note.sharedWith?.length || 0} user(s)` }}
                  </span>
                </v-tooltip>
              </div>
            </template>
          </div>

          <!-- Content -->
          <v-textarea
            :model-value="note.content"
            @update:model-value="(val) => (note.content = val)"
            :key="note.updatedAt"
            placeholder="Start typing..."
            variant="plain"
            rows="3"
            auto-grow
            class="note-content"
            @blur="autoSave(note)"
          />
          <div class="timestamp">
            <small class="text-grey mt-1">Last updated: {{ formatDate(note.updatedAt) }}</small>
          </div>
          <!-- Actions -->
          <v-row
            justify="space-between"
            align-center
            class="note-actions"
            :style="{
              borderTop: '1px solid',
              borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
              backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.03)',
            }"
          >
            <v-btn
              icon
              size="small"
              :color="note.isFavorite ? 'yellow-darken-2' : 'grey-lighten-2'"
              :variant="note.isFavorite ? 'elevated' : 'flat'"
              @click="toggleFavorite(note)"
            >
              <v-icon :color="note.isFavorite ? 'white' : 'grey-darken-3'">
                {{ note.isFavorite ? 'mdi-star' : 'mdi-star-outline' }}
              </v-icon>
            </v-btn>

            <v-btn icon size="small" color="info" @click="summarizeNote(note)">
              <v-icon>mdi-lightbulb-outline</v-icon>
            </v-btn>
            <v-menu v-model="shareMenus[note._id]" :close-on-content-click="false">
              <template #activator="{ props }">
                <v-btn
                  icon
                  size="small"
                  color="primary"
                  v-bind="props"
                  :id="`share-btn-${note._id}`"
                  @click.stop="shareMenus[note._id] = true"
                >
                  <v-icon>mdi-share-variant</v-icon>
                </v-btn>
              </template>

              <v-card style="width: 300px">
                <v-card-title>Share Note</v-card-title>
                <v-card-text>
                  <v-text-field v-model="shareEmail" label="Recipient's Email" dense />
                </v-card-text>
                <v-card-actions>
                  <v-btn text @click="shareMenus[note._id] = false">Cancel</v-btn>
                  <v-btn color="primary" @click="() => shareNote(note)"> Share </v-btn>
                </v-card-actions>
              </v-card>
            </v-menu>

            <v-btn icon size="small" class="delete-btn" @click="deleteNoteById(note._id)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.note-content {
  word-break: break-word;
  white-space: pre-wrap;
}
.truncated-title {
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  width: 100%;
  cursor: pointer;
}
.title-wrapper {
  width: 100%;
}
.delete-btn {
  background-color: #f44336 !important;
  color: white !important;
}

.note-actions {
  padding: 12px 24px;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
}

.timestamp {
  margin: 11px;
}
</style>
