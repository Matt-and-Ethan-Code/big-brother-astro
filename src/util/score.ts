

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
  let score_per_person: { [name: string]: { distance: number, contribution: number } } = {};
  let total_score = 0;
  for (let i = 0; i < predicted.length; ++i) {
    const pred = predicted[i];
    const predicted_evicted_place = i;
    const actual_evicted_place = actual.indexOf(pred);
    const player_still_in = actual_evicted_place == -1;

    let distance: null | number = null;
    if (player_still_in) {  // they havent been evicted yet (they should be in the remaining list)
      // they can still get points based on how close they put the prediction to the end
      const is_player_known = remaining.includes(pred);
      if (!is_player_known) {
        console.warn(`UNKNOWN PLAYER: ${pred}`);
        continue;
      }

      const at_remaining_part = i >= actual.length;
      if (at_remaining_part && remaining.includes(pred)) {
        score_per_person[pred] = {
          distance: 0,
          contribution: 2
        };
        total_score += 2;
        continue;
      }
      else {
        const remaining_place = actual.length; // treat "still in the game" as a bonus entry in the `actual` list
        distance = Math.abs(predicted_evicted_place - remaining_place);
      }
      
    }

    if (distance == null) {
      distance = Math.abs(predicted_evicted_place - actual_evicted_place);
    }
    
    if (distance == 0) {
      score_per_person[pred] = {
        distance,
        contribution: 3
      };
      total_score += 3;
    }
    else if (distance == 1) {
      score_per_person[pred] = {
        distance,
        contribution: 2
      };
      total_score += 2;
    }
    else if (distance == 2) {
      score_per_person[pred] = {
        distance,
        contribution: 1
      };
      total_score += 1;
    }
    else {
      score_per_person[pred] = {
        distance,
        contribution: 0
      };
      total_score += 0;
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

