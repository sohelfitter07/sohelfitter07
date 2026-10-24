/*
 * FAQ accordion accessibility.
 *
 * The FAQ questions are <h3 class="faq-question" role="button"> elements.
 * The per-page toggle script owns the open/close behaviour; this file only
 * adds what a role="button" + tabindex="0" element needs in order to be
 * usable with assistive technology:
 *
 *   1. keeps aria-expanded in sync with the parent .faq-item.active state
 *   2. lets Enter and Space activate the toggle, like a real button
 *
 * It never toggles .active itself, so it cannot conflict with the page's
 * existing click handler.
 */
(function () {
  'use strict';

  function sync(question) {
    var item = question.closest('.faq-item');
    question.setAttribute(
      'aria-expanded',
      item && item.classList.contains('active') ? 'true' : 'false'
    );
  }

  function syncAll() {
    var questions = document.querySelectorAll('.faq-question');
    Array.prototype.forEach.call(questions, sync);
  }

  function enhance(question) {
    question.addEventListener('click', function () {
      // The page handler toggles .active synchronously; read it afterwards.
      setTimeout(function () {
        sync(question);
      }, 0);
    });

    question.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
        event.preventDefault();
        question.click();
      }
    });
  }

  function init() {
    var questions = document.querySelectorAll('.faq-question');
    Array.prototype.forEach.call(questions, enhance);
    // Run once now and again after the page's own "open first item" logic.
    syncAll();
    setTimeout(syncAll, 0);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
