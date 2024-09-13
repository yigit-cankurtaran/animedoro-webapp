let finished = false;

export function setFinished(value: boolean) {
  finished = value;
}

export const getFinished = () => finished;

// old school get/set
// will be replaced with jotai soon
// TODO: replace this with jotai