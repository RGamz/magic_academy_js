/* eslint-env browser */
/* global window, document */

window.renderLesson = async function renderLesson(slug) {
  const titleEl = document.getElementById('lesson-title');
  const breadcrumbLeafEl = document.getElementById('crumb-leaf');
  const imageEl = document.getElementById('lesson-image');
  const tasksEl = document.getElementById('tasks');

  if (!slug) {
    tasksEl.innerHTML = '<div class="bubble">Не указан id урока (?id=lesson_x).</div>';
    return;
  }

  try {
    const response = await fetch(`/api/lessons/${encodeURIComponent(slug)}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    const data = payload?.data?.lesson;

    if (!payload.success || !data) {
      tasksEl.innerHTML = `<div class="bubble">Урок <code>${slug}</code> не найден через API.</div>`;
      return;
    }

    if (data.title) {
      document.title = data.title;
      titleEl.textContent = data.title;
    }

    if (Array.isArray(data.breadcrumb) && data.breadcrumb.length) {
      breadcrumbLeafEl.textContent = data.breadcrumb[data.breadcrumb.length - 1];
    } else {
      breadcrumbLeafEl.textContent = slug.replace(/_/g, ' ');
    }

    if (data.mainImage) {
      imageEl.src = data.mainImage;
      imageEl.alt = data.imageAlt || 'Illustration du cours';
    }

    const tasks = Array.isArray(data.tasks) ? data.tasks : [];
    tasksEl.innerHTML =
      tasks
        .map((task, index) => {
          const audioId = `a${index + 1}`;
          const linesHtml = (task.lines || []).map((line) => `<p>${line}</p>`).join('');
          const audioSources = task.audios || (task.audio ? [task.audio] : []);
          const audioHtml = audioSources
            .map(
              (src, audioIndex) =>
                `<audio id="${audioId}${audioIndex || ''}" src="${src}" controls preload="metadata"></audio>`
            )
            .join('');

          const gameHtml = task.game
            ? `<div class="game-link" style="margin-top:10px">
                 <a href="${task.game}" target="_blank" class="btn ghost">🎮 Joue le jeu!</a>
               </div>`
            : '';

          return `
            <details class="task">
              <summary class="task-summary">
                <span class="bubble"><b>${task.title || 'Задача'}</b></span>
              </summary>
              <div class="task-body">
                ${audioHtml}
                <div class="text">${linesHtml}</div>
                ${gameHtml}
              </div>
            </details>
          `;
        })
        .join('') +
      `
        <div class="actions row" style="margin-top:12px">
          ${tasks
            .map((task, index) =>
              task.audio || (task.audios && task.audios.length)
                ? `<button class="btn" onclick="(function(){
                     const el = document.getElementById('a${index + 1}');
                     if (el) el.play();
                   })()">▶️ Rejouer ${index + 1}</button>`
                : ''
            )
            .join('')}
          <a class="btn ghost" href="../index.html">⟵ Accueil</a>
        </div>
      `;
  } catch (error) {
    console.error(error);
    tasksEl.innerHTML = `
      <div class="bubble">Не удалось загрузить данные урока через API.<br>
      Проверь работу сервера.</div>`;
  }
};
