const slide_timing = {
  duration: 600,
  easing: 'ease',
  fill: 'forwards',
  iterations: 1,
};

const flip_timing = {
  duration: 600,
  easing: 'ease',
  fill: 'forwards',
  iterations: 1,
};

const tabbable_classes = '.title, .question, .answer, .number, .flip-button';
window.flashcards_accepting_input = true;

loadCards('source.csv');

/**
 * Load the flashcards from csv file using papaparse
 * and start the rest of the code when complete.
 * @param {string} filename - The name of the csv file to load
 * @returns {void}
 */
function loadCards(filename) {
  Papa.parse(filename, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function (results) {
      let cards = results.data;
      // Trim the whitespace from all the fields
      for (let i = 0; i < cards.length; i++) {
        let card = cards[i];
        for (let key in card) {
          console.debug(card[key]);
          if (typeof card[key] === 'string') {
            card[key] = card[key].trim();
          }
        }
      }
      // TODO: interpret markdown in the cards
      readyGo(cards);
    },
  });
}

/**
 * Gets some frequently-used variables, sets up the cards, and
 * sets up listeners.
 * @param {array} cards - An array of card objects from the csv file
 * @returns {void}
 */
function readyGo(cards) {
  // Create the flashcards
  let card_array = createCards(cards);
  let current_card = 0;

  let slidebox = document.createElement('div');
  slidebox.classList.add('slidebox');
  document.querySelector('.flashcard').appendChild(slidebox);

  // Put them on the page.
  for (let i = 0; i < card_array.length; i++) {
    slidebox.appendChild(card_array[i]);
  }
  let all_cards = document.querySelectorAll('.flashcard .inner');
  all_cards[0].classList.add('current-card');
  // Set the tabindex on the front of the first card so it can be focused
  all_cards[0].querySelectorAll('.front ').tabIndex = 0;

  // Get the width of the flashcards
  let card_width = Math.round(
    all_cards[1].getBoundingClientRect().left -
      all_cards[0].getBoundingClientRect().left
  );

  // When someone clicks on a flashcard, it flips over to show the answer
  document.querySelectorAll('.flashcard .inner').forEach((flashcard) => {
    flashcard.addEventListener('click', () => {
      flip(flashcard, all_cards, current_card);
    });
  });

  // If someone uses the up or down arrow keys, the flashcard flips
  document.addEventListener('keydown', (event) => {
    if (keyWithoutModifiers(event) === 'ArrowUp') {
      console.debug(event);
      flip(all_cards[current_card], all_cards, current_card);
    } else if (keyWithoutModifiers(event) === 'ArrowDown') {
      flip(all_cards[current_card], all_cards, current_card);
      console.debug(event);
    }
  });

  // When someone swipes, the flashcard slides out and the next one slides in
  var cardbox = new Hammer(document.querySelector('.flashcard'), {});
  cardbox.on('swiperight', function (ev) {
    current_card = cardMoveBuffer('left', current_card, card_width);
  });
  cardbox.on('swipeleft', function (ev) {
    current_card = cardMoveBuffer('right', current_card, card_width);
  });

  // If someone uses the left or right arrow keys, the flashcard slides out and the next one slides in
  document.addEventListener('keydown', (event) => {
    if (keyWithoutModifiers(event) === 'ArrowLeft') {
      current_card = cardMoveBuffer('left', current_card, card_width);
    } else if (keyWithoutModifiers(event) === 'ArrowRight') {
      current_card = cardMoveBuffer('right', current_card, card_width);
    }
  });

  // If someone clicks on the left or right arrow, the flashcard slides out and the next one slides in
  document.querySelectorAll('.arrow-navigation').forEach(function (arrow) {
    arrow.addEventListener('click', () => {
      current_card = cardMoveBuffer(
        Array.from(arrow.classList).join(' '),
        current_card,
        card_width
      );
    });
  });

  let waiter;
  // If someone reizes the window, get the new card width.
  // Reset the left edge of the cards if needed.
  window.onresize = function () {
    clearTimeout(waiter);
    waiter = setTimeout(handleResize, 100, all_cards);
  };
  
}

/**
 * Move the slidebox so the current card is in the center
 * @param {void}
 * @returns {void}
 */
function handleResize(all_cards) {
  let slidebox = document.querySelector('.slidebox');
  // Move the left edge of the cards so that the current card is in the center
  // Get the position of the left edge of the current card
  let current_card_left = all_cards[current_card].getBoundingClientRect().left;
  // Get the position of the left edge of the slidebox
  let slidebox_left = slidebox.getBoundingClientRect().left;
  // Slide the slidebox so that the current card is in the center
  let delta_width = card_width - (current_card_left - slidebox_left);
  if (delta_width > 0) {
    moveElement(slidebox, delta_width * current_card, 'left', true);
    updateFocus();
  }
}

/**
 * Returns the key of the event, or false if there are modifiers
 * @param {*} event
 * @returns (string|boolean)
 */
function keyWithoutModifiers(event) {
  let modifiers = ['altKey', 'ctrlKey', 'metaKey', 'shiftKey'];
  for (let i = 0; i < modifiers.length; i++) {
    if (event[modifiers[i]]) {
      return false;
    }
  }
  return event.key;
}

/**
 * Creates the flashcard HTML elements
 * @param {array} cards - An array of card objects from the csv file
 * @returns {array} An array of flashcard HTML elements
 */
function createCards(cards) {
  let body = document.querySelector('body');
  let cardElements = [];

  for (let i = 0; i < cards.length; i++) {
    let card = cards[i];
    let cardElement = document.createElement('div');
    cardElement.classList.add('inner');
    let front = document.createElement('div');
    front.classList.add('front');
    let back = document.createElement('div');
    back.classList.add('back');

    let front_content = document.createElement('div');
    front_content.classList.add('card-content');
    let front_title = document.createElement('h2');
    front_title.classList.add('title');
    front_title.innerText = card['Front Title'];
    let question = document.createElement('div');
    question.classList.add('question');
    question.innerText = card.Question;

    let back_content = document.createElement('div');
    back_content.classList.add('card-content');
    let back_title = document.createElement('h2');
    back_title.classList.add('title');
    back_title.innerText = card['Back Title'];
    let answer = document.createElement('div');
    answer.classList.add('answer');
    answer.innerText = card.Answer;

    let front_bottom = document.createElement('div');
    front_bottom.classList.add('bottom');
    let back_bottom = front_bottom.cloneNode(true);

    let front_number = document.createElement('div');
    front_number.classList.add('number');
    front_number.innerText = `${i + 1} of ${cards.length}`;
    let back_number = front_number.cloneNode(true);

    let front_flip = document.createElement('button');
    front_flip.classList.add('flip-button');
    let back_flip = front_flip.cloneNode(true);
    front_flip.innerText = 'Show Answer';
    back_flip.innerText = 'Show Question';

    cardElement.appendChild(front);
    cardElement.appendChild(back);

    front.appendChild(front_content);
    front_content.appendChild(front_title);
    front_content.appendChild(question);
    front_bottom.appendChild(front_number);
    front_bottom.appendChild(front_flip);
    front_content.appendChild(front_bottom);

    back.appendChild(back_content);
    back_content.appendChild(back_title);
    back_content.appendChild(answer);
    back_bottom.appendChild(back_number);
    back_bottom.appendChild(back_flip);
    back_content.appendChild(back_bottom);

    // Set all the tab indexes to -1 except for the first front.
    cardElement.querySelectorAll('*').forEach(function (element) {
      element.setAttribute('tabindex', '-1');
    });
    if (i === 0) {
      front.querySelectorAll(tabbable_classes).forEach(function (element) {
        element.setAttribute('tabindex', '0');
      });
    }

    cardElements.push(cardElement);
    body.appendChild(cardElement);
  }
  return cardElements;
}

/**
 * Set the tab index of certain pieces of the current side of the current card
 * to 0, and all the rest to -1. Then focus the current visible side.
 * @param {void}
 * @returns {void}
 */
function updateFocus() {
  // Wait 110ms for the slidebox to finish moving.
  setTimeout(function () {
    let inner = document.querySelector('.flashcard .current-card');
    let front = inner.querySelector('.front');
    let back = inner.querySelector('.back');

    // Set all the tab indexes to -1 before we start.
    document.querySelectorAll(tabbable_classes).forEach(function (element) {
      element.setAttribute('tabindex', '-1');
    });

    if (inner.classList.contains('flip')) {
      front.querySelectorAll('*').forEach(function (element) {
        element.setAttribute('tabindex', '-1');
      });
      back.querySelectorAll(tabbable_classes).forEach(function (element) {
        element.setAttribute('tabindex', '0');
      });
      back.querySelector('h2').focus();
    } else {
      front.querySelectorAll(tabbable_classes).forEach(function (element) {
        element.setAttribute('tabindex', '0');
      });
      back.querySelectorAll('*').forEach(function (element) {
        element.setAttribute('tabindex', '-1');
      });
      front.querySelector('h2').focus();
    }
  }, 110);
}

/**
 * Flips the card and calls updateFocus()
 * @param {HTMLElement} inner - The inner div of the card to flip
 * @returns {void}
 */
function flip(inner) {
  let flip_options = [];
  inner.classList.toggle('flip');
  if (inner.classList.contains('flip')) {
    flip_options = [{ rotate: 'y 0deg' }, { rotate: 'y 180deg' }];
  } else {
    flip_options = [{ rotate: 'y 180deg' }, { rotate: 'y 0deg' }];
  }
  inner.animate(flip_options, flip_timing);
  updateFocus();
}

/**
 * Takes in the command to move a card and waits some
 * so we don't move again in the middle of a move.
 * @param {string} direction - The direction to move the card
 * @param {number} current_card - The current card number
 * @param {number} card_width - The width of the card
 */
function cardMoveBuffer(direction, current_card, card_width) {
  // console.debug("cardMoveBuffer");
  if (window.flashcards_accepting_input) {
    current_card = slideCard(direction, current_card, card_width);
    window.flashcards_accepting_input = false;
    setTimeout(function () {
      window.flashcards_accepting_input = true;
      updateFocus();
    }, slide_timing.duration);
    return current_card;
  }
  return current_card;
}

/**
 * Moves the card in the given direction
 * @param {string} direction - The direction to move the card
 * @param {number} current_card - The current card number
 * @param {number} card_width - The width of the card
 * @returns {number} - The new current card number
 */
function slideCard(class_list, current_card, card_width) {
  // console.debug("slideCard");
  let slidebox = document.querySelector('.flashcard .slidebox');
  let all_cards = document.querySelectorAll('.flashcard .inner');
  let direction = class_list.includes('left') ? 'right' : 'left';
  let other_direction = direction === 'left' ? 'right' : 'left';

  if (direction === 'left') {
    current_card++;
  } else if (direction === 'right') {
    current_card--;
  }

  if (current_card < 0) {
    moveElement(slidebox, card_width * (all_cards.length - 1), other_direction);
    current_card = all_cards.length - 1;
  } else if (current_card < all_cards.length) {
    moveElement(slidebox, card_width, direction);
  } else {
    // If there's no next element, go back to the beginning
    moveElement(slidebox, card_width * (all_cards.length - 1), other_direction);
    current_card = 0;
  }

  // recenterCards(all_cards, current_card);

  // Mark the current card.
  for (c of all_cards) {
    c.classList.remove('current-card');
  }
  all_cards[current_card].classList.add('current-card');
  return current_card;
}

/**
 * Moves the element in the given direction using .animate()
 * @param {HTMLElement} elem - The element to move
 * @param {number} distance - The distance to move the element
 * @param {string} direction - The direction to move the element
 * @returns {void}
 */
function moveElement(elem, distance, direction, fast = false) {
  let slide_options = makeSlideOptions(elem, distance, direction);
  // console.debug(slide_options[1]);
  if (fast) {
    elem.animate(slide_options, {
      duration: 300,
      easing: 'ease',
      fill: 'forwards',
      iterations: 1,
    });
  } else {
    elem.animate(slide_options, slide_timing);
  }
}

/**
 * Helper function to create the options for .animate()
 * @param {*} elem - The element to move
 * @param {*} distance - The distance to move the element
 * @param {*} direction - The direction to move the element
 * @returns {Array} - The options for .animate()
 */
function makeSlideOptions(elem, distance, direction) {
  let animate_text = '';
  let current_position = { x: position(elem).x, y: position(elem).y };

  if (direction === 'right') {
    animate_text = current_position.x + distance + 'px';
  } else if (direction === 'left') {
    animate_text = current_position.x - distance + 'px';
  } else if (direction === 'up') {
    animate_text = ' ' + current_position.y - distance + 'px';
  } else if (direction === 'down') {
    animate_text = ' ' + current_position.y + distance + 'px';
  } else {
    console.debug(
      "Invalid direction. Must be 'right', 'left', 'up', or 'down'."
    );
  }

  return [
    { translate: position(elem).x + 'px ' + position(elem).y + 'px' },
    { translate: animate_text },
  ];
}

/**
 * Gets the x/y position of an element taking into account bounding
 * rectangles, offsets, and scroll positions.
 * @param {HTMLElement} elem - The element to get the position of
 * @returns {object} - The position of the element {x: number, y: number}
 */
function position(elem) {
  return {
    y: Math.round(
      elem.getBoundingClientRect().top -
        elem.offsetTop -
        elem.offsetParent.offsetTop +
        document.body.scrollTop
    ),
    x: Math.round(
      elem.getBoundingClientRect().left -
        elem.offsetLeft -
        elem.offsetParent.offsetLeft +
        document.body.scrollLeft
    ),
  };
}
