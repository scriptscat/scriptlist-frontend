export interface ScriptsStateInterface {
  scripts: DTO.Script[]
  version: DTO.ScriptCode[]
  total: number,
  script: DTO.Script,
  preFetch: boolean
}

function state(): ScriptsStateInterface {
  return {
    scripts: [],
    version: [],
    total: 0,
    script: <DTO.Script>{},
    preFetch: true
  }
};

export default state;
