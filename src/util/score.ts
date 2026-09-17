

export const ACTUAL = [
  "Ashley",
  "Rome",
  "Jason",
  "Lyric",
  "Chuk",
  "Kamu",
  "Mallory",
  "Haley",
  "La Trice",
  "Angela",
];

export const REMAINING = [
  "Yash",
  "Taylor",
  "Devens",
  "Melody",
  "Drew",
  "Dee",
  "Barrett",
];

function score_impl(predicted: string[], actual: string[], remaining: string[]) {
  const index_of_last_evicted_player = actual.length - 1;
  let score_per_person: { [name: string]: { distance: number, contribution: number } } = {};
  let total_score = 0;

  function set_score(player: string, distance: number, score_override?: number) {
    const contribution = score_override == null ? Math.max(0, 3 - distance) : score_override;
    score_per_person[player] = {
      distance,
      contribution,
    }
    total_score += contribution;
  }

  // score for players that have been evicted
  for (let i = 0; i < actual.length; ++i) {
    const player = actual[i];
    const predicted_evicted_place = predicted.indexOf(player);
    if (predicted_evicted_place == -1) {
      console.warn(`PLAYER NOT FOUND IN USER PREDICTIONS: ${player}`);
      continue;
    }

    const distance = Math.abs(predicted_evicted_place - i);
    set_score(player, distance);
  }

  // score for players that are still in
  for (let i = 0; i < remaining.length; ++i) {
    const player = remaining[i];
    const guessed_position = predicted.indexOf(player);
    if (guessed_position == -1) {
      console.warn(`PLAYER NOT FOUND IN USER PREDICTIONS: ${player}`);
      continue;
    }

    const correctly_placed_them_at_the_end = guessed_position >= index_of_last_evicted_player;
    if (correctly_placed_them_at_the_end) {
      set_score(player, 0, 2);
    }
    else {
      // didn't place them at the end but maybe they still put them close to the end
      // treat the remaining players like one big block (order doesn't matter)
      const pretend_houseguest_position = index_of_last_evicted_player + 1;
      const distance = Math.abs(guessed_position - pretend_houseguest_position);
      set_score(player, distance);
    }
  }

  return {
    total: total_score,
    per_person: score_per_person,
  };
}

export function score(predicted: string[]) {
  return score_impl(predicted, ACTUAL, REMAINING);
}

export const MAX_SCORE: number = score_impl([...ACTUAL, ...REMAINING], ACTUAL, REMAINING).total;
