export interface ScriptsStateInterface {
  scripts: DTO.Script[]
  total: number,
  script: DTO.Script,
}

function state(): ScriptsStateInterface {
  return {
    scripts: [],
    total: 0,
    script: <DTO.Script>{},
  }
};

export default state;
