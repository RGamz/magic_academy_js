/* eslint-env browser */
/* global window, document, localStorage */

// Общие утилиты
window.play = function play(id) {
  const element = document.getElementById(id);
  if (element) {
    element.play();
  }
};

window.next = function next(currentId, nextId) {
  const current = document.getElementById(currentId);
  const nextElement = document.getElementById(nextId);
  if (current) {
    current.classList.add('hidden');
  }
  if (nextElement) {
    nextElement.classList.remove('hidden');
  }
};

// Небольшая «качалка» UX: запоминать позицию аудио (перезапуск — продолжим с места)
(function persistAudioPosition() {
  const audios = document.querySelectorAll('audio[id]');
  audios.forEach((audio) => {
    const key = `audio:${audio.id}`;
    const saved = Number(localStorage.getItem(key)) || 0;
    if (!Number.isNaN(saved) && saved > 0) {
      audio.currentTime = Math.max(0, saved - 1);
    }

    audio.addEventListener('timeupdate', () => {
      if (!audio.duration) return;
      if (Math.floor(audio.currentTime) % 3 === 0) {
        localStorage.setItem(key, String(Math.floor(audio.currentTime)));
      }
    });
  });
})();
