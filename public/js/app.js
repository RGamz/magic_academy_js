// Общие утилиты
function play(id){
  const el = document.getElementById(id);
  if (el) el.play();
}
function next(curr,nextId){
  const c = document.getElementById(curr);
  const n = document.getElementById(nextId);
  if (c) c.classList.add('hidden');
  if (n) n.classList.remove('hidden');
}

// Небольшая «качалка» UX: запоминать позицию аудио (перезапуск — продолжим с места)
(function persistAudioPosition(){
  const audios = document.querySelectorAll('audio[id]');
  audios.forEach(a => {
    const key = 'audio:'+a.id;
    // восстановить
    const saved = +localStorage.getItem(key) || 0;
    if (!isNaN(saved) && saved > 0) {
      a.currentTime = Math.max(0, saved - 1); // чуть откатить назад
    }
    // сохранять каждые N сек
    a.addEventListener('timeupdate', () => {
      if (!a.duration) return;
      // экономим записи
      if (Math.floor(a.currentTime) % 3 === 0){
        localStorage.setItem(key, String(Math.floor(a.currentTime)));
      }
    });
  });
})();

function play(id){
  const el = document.getElementById(id);
  if (el) el.play();
}
function next(curr,nextId){
  const c = document.getElementById(curr);
  const n = document.getElementById(nextId);
  if (c) c.classList.add('hidden');
  if (n) n.classList.remove('hidden');
}